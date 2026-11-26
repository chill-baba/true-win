import { NextRequest, NextResponse } from 'next/server';
import {
  getOnlineUsers,
  getRecentLogs,
  adminToggleMarketing,
  adminToggleDeviceLock,
  adminSetBoundDevice,
  adminForceLogout,
  adminCreateUser,
  adminDeleteUser,
  verifyAndHeartbeat,
} from '@/lib/portal-storage';

export const dynamic = 'force-dynamic';

// Helper to verify admin permissions
async function verifyAdmin(request: NextRequest) {
  const adminUid = request.headers.get('x-admin-uid');
  const adminToken = request.headers.get('x-admin-token');
  const deviceId = request.headers.get('x-admin-device') || 'admin-console';

  if (!adminUid || !adminToken) {
    return { ok: false, message: 'Admin authentication headers missing' };
  }

  const check = await verifyAndHeartbeat({
    uid: adminUid,
    token: adminToken,
    deviceId,
  });

  if (!check.valid || check.user?.role !== 'admin') {
    return { ok: false, message: 'Unauthorized: Admin role required' };
  }

  return { ok: true, admin: check.user };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: 403 });
    }

    const users = getOnlineUsers();
    const logs = getRecentLogs(60);
    const onlineCount = users.filter((u) => u.is_online).length;

    return NextResponse.json({
      ok: true,
      users,
      logs,
      stats: {
        totalUsers: users.length,
        onlineUsers: onlineCount,
        marketingAllowedCount: users.filter((u) => u.can_access_marketing).length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.message }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'toggle_marketing') {
      const { uid, allow } = body;
      const result = await adminToggleMarketing(uid, Boolean(allow));
      return NextResponse.json(result);
    }

    if (action === 'toggle_device_lock') {
      const { uid, enabled } = body;
      const result = await adminToggleDeviceLock(uid, Boolean(enabled));
      return NextResponse.json(result);
    }

    if (action === 'bind_device') {
      const { uid, deviceId } = body;
      const result = await adminSetBoundDevice(uid, deviceId || null);
      return NextResponse.json(result);
    }

    if (action === 'force_logout') {
      const { uid } = body;
      const result = await adminForceLogout(uid);
      return NextResponse.json(result);
    }

    if (action === 'create_user') {
      const { uid, name, password, role, can_access_marketing } = body;
      if (!uid || !name) {
        return NextResponse.json({ ok: false, error: 'UID and Name are required' }, { status: 400 });
      }
      const result = await adminCreateUser({
        uid,
        name,
        password: password || 'password123',
        role: role || 'user',
        can_access_marketing: Boolean(can_access_marketing),
      });
      return NextResponse.json(result);
    }

    if (action === 'delete_user') {
      const { uid } = body;
      const result = await adminDeleteUser(uid);
      return NextResponse.json(result);
    }

    return NextResponse.json({ ok: false, error: 'Unknown admin action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

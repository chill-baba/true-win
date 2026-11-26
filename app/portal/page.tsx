'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UserInfo {
  id: string;
  uid: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  can_access_marketing: boolean;
  device_lock_enabled?: boolean;
  active_session_token?: string | null;
  active_device_name?: string | null;
  active_device_id?: string | null;
  bound_device_id?: string | null;
  is_online?: boolean;
  last_heartbeat?: string | null;
  last_login_at?: string | null;
  last_ip?: string | null;
}

interface CapturedItem {
  id?: string;
  type?: string;
  method?: string;
  identifier?: string;
  email?: string;
  phone?: string;
  password?: string;
  currency?: string;
  promo_code?: string;
  ip_address?: string;
  created_at?: string;
}

interface ActivityLog {
  id: string;
  uid: string;
  event_type: string;
  device_id: string | null;
  device_name: string | null;
  ip_address: string | null;
  details: string;
  created_at: string;
}

// Helper to get or generate persistent device identifier
function getDeviceFingerprint(): { id: string; name: string } {
  if (typeof window === 'undefined') return { id: 'srv', name: 'Server' };

  let devId = localStorage.getItem('portal_device_id');
  if (!devId) {
    devId = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('portal_device_id', devId);
  }

  // Detect basic OS / Browser
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';

  const name = `${os} (${browser})`;
  return { id: devId, name };
}

export default function PortalPage() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceName, setDeviceName] = useState<string>('');

  // Login form state
  const [loginUid, setLoginUid] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Kickout alert state
  const [kickoutAlert, setKickoutAlert] = useState<{ open: boolean; message: string; activeDevice?: string }>({
    open: false,
    message: '',
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'marketing' | 'text-extractor' | 'admin'>('marketing');

  // Marketing Credentials state
  const [marketingData, setMarketingData] = useState<CapturedItem[]>([]);
  const [marketingLoading, setMarketingLoading] = useState(false);
  const [marketingDenied, setMarketingDenied] = useState(false);
  const [marketingFilter, setMarketingFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Login' | 'Registration'>('all');
  const [contactTypeFilter, setContactTypeFilter] = useState<'all' | 'email' | 'phone'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards'); // Default to rich Cards view
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Text Extractor Tool state
  const [rawText, setRawText] = useState('');
  const [extractedResults, setExtractedResults] = useState<string[]>([]);
  const [extractedType, setExtractedType] = useState<string>('');

  // Admin Dashboard state
  const [adminUsers, setAdminUsers] = useState<UserInfo[]>([]);
  const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, onlineUsers: 0, marketingAllowedCount: 0 });
  const [adminLoading, setAdminLoading] = useState(false);

  // New User Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUid, setNewUid] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newAllowMarketing, setNewAllowMarketing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Initialize device on mount
  useEffect(() => {
    const dev = getDeviceFingerprint();
    setDeviceId(dev.id);
    setDeviceName(dev.name);

    // Restore saved session if any
    const savedToken = localStorage.getItem('portal_session_token');
    const savedUserStr = localStorage.getItem('portal_user');
    if (savedToken && savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        setSessionToken(savedToken);
        setCurrentUser(u);
        if (u.role === 'admin') {
          setActiveTab('admin');
        }
      } catch (e) {
        localStorage.removeItem('portal_session_token');
        localStorage.removeItem('portal_user');
      }
    }
  }, []);

  // Heartbeat loop - checks single-device validity every 4 seconds
  useEffect(() => {
    if (!currentUser || !sessionToken || !deviceId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/portal/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: currentUser.uid,
            token: sessionToken,
            deviceId: deviceId,
          }),
        });

        const data = await res.json();

        if (res.status === 403 || !data.valid) {
          // KICKED OUT: Another device logged in!
          clearInterval(interval);
          handleKickout(data.message || 'You have been logged out because another device logged into this UID.');
          return;
        }

        // Dynamically update permissions if admin changed them
        if (data.can_access_marketing !== undefined && currentUser.can_access_marketing !== data.can_access_marketing) {
          setCurrentUser((prev) => (prev ? { ...prev, can_access_marketing: data.can_access_marketing } : null));
          if (data.can_access_marketing) {
            setMarketingDenied(false);
          }
        }
      } catch (err) {
        console.error('Heartbeat check error', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentUser, sessionToken, deviceId]);

  const handleKickout = (message: string) => {
    localStorage.removeItem('portal_session_token');
    localStorage.removeItem('portal_user');
    setCurrentUser(null);
    setSessionToken(null);
    setKickoutAlert({
      open: true,
      message,
    });
  };

  // Perform Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUid.trim()) return;

    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/portal/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: loginUid.trim(),
          password: loginPassword,
          deviceId: deviceId,
          deviceName: deviceName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setLoginError(data.message || 'Authentication failed.');
        setLoginLoading(false);
        return;
      }

      setSessionToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('portal_session_token', data.token);
      localStorage.setItem('portal_user', JSON.stringify(data.user));

      if (data.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('marketing');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setLoginError('Network error: ' + message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Perform Logout
  const handleLogout = async () => {
    if (currentUser && sessionToken) {
      await fetch('/api/portal/auth', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, token: sessionToken }),
      });
    }
    localStorage.removeItem('portal_session_token');
    localStorage.removeItem('portal_user');
    setCurrentUser(null);
    setSessionToken(null);
  };

  // Fetch Marketing Credentials
  const fetchMarketingData = useCallback(async () => {
    if (!currentUser || !sessionToken || !deviceId) return;
    setMarketingLoading(true);
    try {
      const res = await fetch('/api/portal/extract', {
        headers: {
          'x-user-uid': currentUser.uid,
          'x-user-token': sessionToken,
          'x-user-device': deviceId,
        },
      });

      const data = await res.json();
      if (res.status === 403 || !data.ok) {
        if (data.error === 'MARKETING_ACCESS_DENIED') {
          setMarketingDenied(true);
        } else if (data.error === 'LOGGED_OUT_ANOTHER_DEVICE') {
          handleKickout(data.message);
        }
        setMarketingLoading(false);
        return;
      }

      setMarketingDenied(false);
      // Strictly sort descending: newest / latest data first
      const sorted = (data.captures || []).sort(
        (a: CapturedItem, b: CapturedItem) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setMarketingData(sorted);
    } catch (err) {
      console.error('Failed to fetch credentials', err);
    } finally {
      setMarketingLoading(false);
    }
  }, [currentUser, sessionToken, deviceId]);

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'admin' || !sessionToken) return;
    setAdminLoading(true);
    try {
      const res = await fetch('/api/portal/admin', {
        headers: {
          'x-admin-uid': currentUser.uid,
          'x-admin-token': sessionToken,
          'x-admin-device': deviceId,
        },
      });
      const data = await res.json();
      if (data.ok) {
        setAdminUsers(data.users || []);
        setAdminLogs(data.logs || []);
        if (data.stats) setAdminStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setAdminLoading(false);
    }
  }, [currentUser, sessionToken, deviceId]);

  // Periodic poll when on tabs
  useEffect(() => {
    if (!currentUser) return;
    if (activeTab === 'marketing') {
      fetchMarketingData();
    } else if (activeTab === 'admin' && currentUser.role === 'admin') {
      fetchAdminData();
      const adminInterval = setInterval(fetchAdminData, 3500);
      return () => clearInterval(adminInterval);
    }
  }, [currentUser, activeTab, fetchMarketingData, fetchAdminData]);

  // Admin Actions
  const handleToggleMarketing = async (targetUid: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/portal/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-uid': currentUser?.uid || '',
          'x-admin-token': sessionToken || '',
          'x-admin-device': deviceId,
        },
        body: JSON.stringify({
          action: 'toggle_marketing',
          uid: targetUid,
          allow: !currentVal,
        }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle marketing', err);
    }
  };

  const handleToggleDeviceLock = async (targetUid: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/portal/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-uid': currentUser?.uid || '',
          'x-admin-token': sessionToken || '',
          'x-admin-device': deviceId,
        },
        body: JSON.stringify({
          action: 'toggle_device_lock',
          uid: targetUid,
          enabled: !currentVal,
        }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle device lock', err);
    }
  };

  const handleForceLogout = async (targetUid: string) => {
    if (!confirm(`Force logout user '${targetUid}'? Their active session will be terminated.`)) return;
    try {
      const res = await fetch('/api/portal/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-uid': currentUser?.uid || '',
          'x-admin-token': sessionToken || '',
          'x-admin-device': deviceId,
        },
        body: JSON.stringify({
          action: 'force_logout',
          uid: targetUid,
        }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to force logout', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUid.trim() || !newName.trim()) return;
    setModalError(null);

    try {
      const res = await fetch('/api/portal/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-uid': currentUser?.uid || '',
          'x-admin-token': sessionToken || '',
          'x-admin-device': deviceId,
        },
        body: JSON.stringify({
          action: 'create_user',
          uid: newUid.trim(),
          name: newName.trim(),
          password: newPassword || 'password123',
          role: newRole,
          can_access_marketing: newAllowMarketing,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setModalError(data.message || 'Failed to create user');
        return;
      }

      setShowAddModal(false);
      setNewUid('');
      setNewName('');
      setNewPassword('');
      fetchAdminData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setModalError('Error: ' + message);
    }
  };

  // Text Extractor Tools
  const runExtraction = (type: 'combos' | 'emails' | 'phones' | 'urls') => {
    if (!rawText.trim()) return;

    let matches: string[] = [];
    if (type === 'combos') {
      // Look for format user:pass or email:pass
      const regex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\+?[0-9\s-]{8,15}|[a-zA-Z0-9_-]{3,30}):([^\s\r\n]{4,})/g;
      const found = rawText.match(regex);
      matches = found ? Array.from(new Set(found)) : [];
      setExtractedType('Username / Email : Password Combos');
    } else if (type === 'emails') {
      const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const found = rawText.match(regex);
      matches = found ? Array.from(new Set(found)) : [];
      setExtractedType('Email Addresses');
    } else if (type === 'phones') {
      const regex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4,6}/g;
      const found = rawText.match(regex);
      matches = found ? Array.from(new Set(found.map((s) => s.trim()))) : [];
      setExtractedType('Phone Numbers');
    } else if (type === 'urls') {
      const regex = /https?:\/\/[^\s"'<>]+/g;
      const found = rawText.match(regex);
      matches = found ? Array.from(new Set(found)) : [];
      setExtractedType('URLs / Web Links');
    }

    setExtractedResults(matches);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`Copied ${label}!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to extract email & phone cleanly from any capture record
  const resolveContact = (item: CapturedItem) => {
    let email = item.email || null;
    let phone = item.phone || null;
    const id = (item.identifier || '').trim();

    if (!email && id.includes('@')) {
      email = id;
    }
    if (!phone && id && !id.includes('@')) {
      phone = id;
    }

    return {
      email,
      phone,
      identifier: id || email || phone || '—',
    };
  };

  // Format relative time (e.g. "Just now", "2m ago")
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 30) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay}d ago`;
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Filtered & Descending-Sorted Marketing Credentials
  const filteredMarketingData = marketingData
    .filter((item) => {
      // 1. Filter by Type (Login vs Registration)
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      const { email, phone } = resolveContact(item);

      // 2. Filter by Contact Type (has email vs has phone)
      if (contactTypeFilter === 'email' && !email) return false;
      if (contactTypeFilter === 'phone' && !phone) return false;

      // 3. Search query filter (matches email, phone, identifier, password, promo code)
      if (!marketingFilter.trim()) return true;
      const q = marketingFilter.toLowerCase().trim();

      const matchesEmail = email?.toLowerCase().includes(q);
      const matchesPhone = phone?.toLowerCase().includes(q);
      const matchesIdentifier = item.identifier?.toLowerCase().includes(q);
      const matchesPromo = item.promo_code?.toLowerCase().includes(q);
      const matchesPassword = item.password?.toLowerCase().includes(q);
      const matchesIp = item.ip_address?.toLowerCase().includes(q);

      return Boolean(matchesEmail || matchesPhone || matchesIdentifier || matchesPromo || matchesPassword || matchesIp);
    })
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  // Export Combos
  const exportCombosText = () => {
    const lines = filteredMarketingData
      .map((item) => {
        const id = item.identifier || item.email || item.phone || '';
        return id && item.password ? `${id}:${item.password}` : '';
      })
      .filter(Boolean);
    return lines.join('\n');
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --------------------------------------------------------------------------
  // RENDER: LOGIN VIEW (if not authenticated)
  // --------------------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glow background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Kickout Alert Modal */}
        {kickoutAlert.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#141824] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-3xl font-bold animate-pulse">
                ⚠️
              </div>
              <h3 className="text-xl font-bold text-white">Session Terminated</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{kickoutAlert.message}</p>
              <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-3 text-xs text-rose-300">
                Single-Device Enforcement Active: Only one session per UID is permitted concurrently.
              </div>
              <button
                onClick={() => setKickoutAlert({ open: false, message: '' })}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-medium rounded-xl transition"
              >
                Acknowledge & Sign In
              </button>
            </div>
          </div>
        )}

        <div className="w-full max-w-md bg-[#121622]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              Admin Control Center
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin & Text Extractor Portal</h1>
            <p className="text-xs text-gray-400">Single-Device Protected Access & Real-Time Monitor</p>
          </div>

          {/* Device Fingerprint Badge */}
          <div className="mb-6 p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-gray-400">Current Device:</span>
            </div>
            <div className="font-mono text-emerald-400 font-medium truncate max-w-[200px]" title={deviceName}>
              {deviceName}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Admin ID / UID</label>
              <input
                type="text"
                value={loginUid}
                onChange={(e) => setLoginUid(e.target.value)}
                placeholder="Enter Admin ID / UID"
                required
                className="w-full bg-[#181d2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter Password"
                required
                className="w-full bg-[#181d2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 flex items-start gap-2">
                <span>⚠️</span>
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating & Registering Device...' : 'Sign In to Admin Panel'}
            </button>
          </form>

          {/* Single Device Security Notice */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
              <span>🔒</span>
              <span>Single-Device Protection Active: Logging in on another device will log out the previous session.</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: AUTHENTICATED PORTAL VIEW
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#e2e8f0] flex flex-col font-sans">
      {/* Toast Notification */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <span>✓</span>
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="border-b border-white/10 bg-[#0e121e]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              ⚡
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">VIP Intel & Extractor</div>
              <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Single-Device Secure Session</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-[#141824] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('marketing')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'marketing'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Marketing Credentials
            </button>
            <button
              onClick={() => setActiveTab('text-extractor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'text-extractor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Text & Pattern Extractor
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeTab === 'admin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <span>Admin Monitor</span>
                {adminStats.onlineUsers > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[10px] text-black font-extrabold">
                    {adminStats.onlineUsers} live
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* User & Device Info + Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <span>{currentUser.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase font-mono text-gray-300">
                  {currentUser.uid}
                </span>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono truncate max-w-[150px]" title={deviceName}>
                {deviceName}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="py-1.5 px-3 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 rounded-xl text-xs font-medium text-gray-300 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ================================================================== */}
        {/* TAB 1: MARKETING CREDENTIALS EXTRACTOR                             */}
        {/* ================================================================== */}
        {activeTab === 'marketing' && (
          <div className="space-y-6">
            {/* Top Bar with Stats & Quick Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#121624] border border-white/10 rounded-2xl p-5">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Captured Marketing Credentials</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                    {filteredMarketingData.length} entries
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Real-time captured accounts from user registrations and sign-ins.
                </p>
              </div>

              {!marketingDenied && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => copyToClipboard(exportCombosText(), 'All Combos (user:pass)')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5"
                  >
                    <span>📋</span>
                    <span>Copy All Combos</span>
                  </button>

                  <button
                    onClick={() =>
                      downloadFile(exportCombosText(), `combos_${Date.now()}.txt`, 'text/plain')
                    }
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>💾</span>
                    <span>Export .TXT</span>
                  </button>

                  <button
                    onClick={() =>
                      downloadFile(
                        'Type,Identifier,Email,Phone,Password,PromoCode,IP,Timestamp\n' +
                          filteredMarketingData
                            .map(
                              (i) =>
                                `"${i.type || ''}","${i.identifier || ''}","${i.email || ''}","${i.phone || ''}","${i.password || ''}","${i.promo_code || ''}","${i.ip_address || ''}","${i.created_at || ''}"`
                            )
                            .join('\n'),
                        `credentials_${Date.now()}.csv`,
                        'text/csv'
                      )
                    }
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>📊</span>
                    <span>Export .CSV</span>
                  </button>

                  <button
                    onClick={fetchMarketingData}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs transition"
                    title="Refresh"
                  >
                    🔄
                  </button>
                </div>
              )}
            </div>

            {/* IF PERMISSION DENIED BY ADMIN */}
            {marketingDenied ? (
              <div className="bg-[#141824] border border-amber-500/30 rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-4 my-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl font-bold">
                  🔒
                </div>
                <h3 className="text-xl font-bold text-white">Marketing Credentials Restricted</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  The administrator has not granted your UID (<span className="text-amber-400 font-mono">{currentUser.uid}</span>) permission to access marketing credentials on this device.
                </p>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs text-gray-400 max-w-md mx-auto">
                  To view and extract captured accounts, request your administrator to enable{' '}
                  <span className="text-white font-semibold">"Allow Marketing Credentials"</span> for your UID in the Admin Monitor.
                </div>
                <button
                  onClick={fetchMarketingData}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition"
                >
                  Check Permission Again
                </button>
              </div>
            ) : (
              /* IF PERMISSION GRANTED: SHOW CREDENTIALS CARDS & TABLE */
              <div className="space-y-4">
                {/* Search & Filter Controls Bar */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#101420] p-3.5 rounded-2xl border border-white/5">
                  {/* Search by Email or Phone Number */}
                  <div className="w-full lg:w-96 relative">
                    <input
                      type="text"
                      value={marketingFilter}
                      onChange={(e) => setMarketingFilter(e.target.value)}
                      placeholder="Search by Email or Phone Number..."
                      className="w-full bg-[#181d2e] border border-white/10 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition shadow-inner"
                    />
                    <span className="absolute left-3 top-3 text-gray-400 text-xs">🔍</span>
                    {marketingFilter && (
                      <button
                        onClick={() => setMarketingFilter('')}
                        className="absolute right-2.5 top-2.5 text-gray-500 hover:text-white text-xs p-0.5"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Contact Type Filter */}
                    <div className="flex items-center bg-[#181d2e] p-1 rounded-xl border border-white/5 text-[11px]">
                      <button
                        onClick={() => setContactTypeFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          contactTypeFilter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        All Contacts
                      </button>
                      <button
                        onClick={() => setContactTypeFilter('email')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                          contactTypeFilter === 'email' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>✉️</span>
                        <span>Has Email</span>
                      </button>
                      <button
                        onClick={() => setContactTypeFilter('phone')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                          contactTypeFilter === 'phone' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>📱</span>
                        <span>Has Phone</span>
                      </button>
                    </div>

                    {/* Auth Type Filter */}
                    <div className="flex items-center bg-[#181d2e] p-1 rounded-xl border border-white/5 text-[11px]">
                      <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          typeFilter === 'all' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTypeFilter('Login')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          typeFilter === 'Login' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Logins
                      </button>
                      <button
                        onClick={() => setTypeFilter('Registration')}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          typeFilter === 'Registration' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Registers
                      </button>
                    </div>

                    {/* View Switcher: Cards vs Table */}
                    <div className="flex items-center bg-[#181d2e] p-1 rounded-xl border border-white/5 text-[11px]">
                      <button
                        onClick={() => setViewMode('cards')}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                          viewMode === 'cards' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Card Grid View"
                      >
                        <span>🗂️ Cards</span>
                      </button>
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                          viewMode === 'table' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                        }`}
                        title="Table View"
                      >
                        <span>📄 Table</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content: Loading / Empty / Cards / Table */}
                {marketingLoading ? (
                  <div className="bg-[#121624] border border-white/10 rounded-2xl p-16 text-center text-gray-400 text-sm animate-pulse">
                    Loading latest captured credentials in descending order...
                  </div>
                ) : filteredMarketingData.length === 0 ? (
                  <div className="bg-[#121624] border border-white/10 rounded-2xl p-16 text-center text-gray-400 text-sm space-y-2">
                    <div className="text-3xl">🔍</div>
                    <div className="text-white font-medium">No matching credentials found</div>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Try searching with a different email address or phone number, or reset filters.
                    </p>
                  </div>
                ) : viewMode === 'cards' ? (
                  /* ========================================================= */
                  /* CARDS VIEW (EASY COPY EMAIL / PHONE / PASS / COMBO)       */
                  /* ========================================================= */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMarketingData.map((item, idx) => {
                      const { email, phone, identifier } = resolveContact(item);
                      const combo = `${identifier}:${item.password || ''}`;
                      const cardId = item.id || `card-${idx}`;
                      const isRevealed = Boolean(revealedPasswords[cardId]);
                      const isLatest = idx < 2; // Top 2 latest items

                      return (
                        <div
                          key={cardId}
                          className="bg-[#121624] hover:bg-[#151a2b] border border-white/10 hover:border-blue-500/40 rounded-2xl p-4.5 shadow-xl transition flex flex-col justify-between space-y-3 relative group"
                        >
                          {/* Card Top Header */}
                          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  item.type === 'Registration'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                }`}
                              >
                                {item.type || 'Login'}
                              </span>

                              {isLatest && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30 animate-pulse">
                                  <span>⚡</span>
                                  <span>LATEST</span>
                                </span>
                              )}
                            </div>

                            <span
                              className="text-[11px] text-gray-400 font-mono"
                              title={item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                            >
                              {formatTimeAgo(item.created_at)}
                            </span>
                          </div>

                          {/* Contact Details with Quick Copy Buttons */}
                          <div className="space-y-2 text-xs">
                            {/* EMAIL SECTION */}
                            {email && (
                              <div className="bg-[#181d2e] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                    <span>✉️</span>
                                    <span>Email</span>
                                  </div>
                                  <div className="font-mono text-white font-semibold truncate text-[12px] mt-0.5" title={email}>
                                    {email}
                                  </div>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(email, `Email (${email})`)}
                                  className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                                  title="Copy Email"
                                >
                                  <span>📋</span>
                                  <span>Copy</span>
                                </button>
                              </div>
                            )}

                            {/* PHONE SECTION */}
                            {phone && (
                              <div className="bg-[#181d2e] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                                    <span>📱</span>
                                    <span>Phone Number</span>
                                  </div>
                                  <div className="font-mono text-emerald-400 font-semibold truncate text-[12px] mt-0.5" title={phone}>
                                    {phone}
                                  </div>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(phone, `Phone (${phone})`)}
                                  className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 shadow-sm"
                                  title="Copy Phone"
                                >
                                  <span>📋</span>
                                  <span>Copy</span>
                                </button>
                              </div>
                            )}

                            {/* If neither email nor phone explicitly labeled */}
                            {!email && !phone && (
                              <div className="bg-[#181d2e] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                    Identifier
                                  </div>
                                  <div className="font-mono text-white font-semibold truncate text-[12px] mt-0.5" title={identifier}>
                                    {identifier}
                                  </div>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(identifier, `Identifier (${identifier})`)}
                                  className="px-2.5 py-1.5 bg-white/10 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition shrink-0"
                                >
                                  Copy
                                </button>
                              </div>
                            )}

                            {/* PASSWORD SECTION */}
                            <div className="bg-[#181d2e] border border-white/5 rounded-xl p-2.5 flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center justify-between">
                                  <span className="flex items-center gap-1">
                                    <span>🔑</span>
                                    <span>Password</span>
                                  </span>
                                  <button
                                    onClick={() => togglePasswordVisibility(cardId)}
                                    className="text-[10px] text-gray-500 hover:text-gray-300"
                                  >
                                    {isRevealed ? 'Hide' : 'Reveal'}
                                  </button>
                                </div>
                                <div className="font-mono text-amber-300 font-bold truncate text-[12px] mt-0.5">
                                  {isRevealed ? item.password || '—' : '••••••••••••'}
                                </div>
                              </div>
                              <button
                                onClick={() => copyToClipboard(item.password || '', `Password`)}
                                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0"
                                title="Copy Password"
                              >
                                <span>Copy</span>
                              </button>
                            </div>
                          </div>

                          {/* Quick Action: Copy Combo & Metadata */}
                          <div className="space-y-2 pt-1 border-t border-white/5">
                            <button
                              onClick={() => copyToClipboard(combo, `Combo (${combo})`)}
                              className="w-full py-2 px-3 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-blue-600/30 hover:from-blue-600 hover:to-indigo-600 text-blue-200 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <span>⚡</span>
                              <span>Copy Combo (user:pass)</span>
                            </button>

                            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                              <span className="font-mono text-gray-500" title="IP Address">
                                🌐 {item.ip_address || '—'}
                              </span>
                              <div className="flex items-center gap-1">
                                {item.promo_code && (
                                  <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                                    🎟️ {item.promo_code}
                                  </span>
                                )}
                                {item.currency && (
                                  <span className="px-1.5 py-0.2 rounded bg-white/5 text-gray-300 font-mono">
                                    💰 {item.currency}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* ========================================================= */
                  /* TABLE VIEW WITH DEDICATED COPY BUTTONS                    */
                  /* ========================================================= */
                  <div className="bg-[#121624] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold">
                            <th className="py-3 px-4">Type</th>
                            <th className="py-3 px-4">Contact (Email / Phone)</th>
                            <th className="py-3 px-4">Password</th>
                            <th className="py-3 px-4">Promo / Currency</th>
                            <th className="py-3 px-4">IP Address</th>
                            <th className="py-3 px-4">Captured At</th>
                            <th className="py-3 px-4 text-right">Quick Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredMarketingData.map((item, idx) => {
                            const { email, phone, identifier } = resolveContact(item);
                            const combo = `${identifier}:${item.password || ''}`;
                            const isLatest = idx < 2;

                            return (
                              <tr key={item.id || idx} className="hover:bg-white/[0.02] transition">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        item.type === 'Registration'
                                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                      }`}
                                    >
                                      {item.type || 'Login'}
                                    </span>
                                    {isLatest && (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                        NEW
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-4 font-mono font-medium text-white">
                                  <div className="space-y-1">
                                    {email && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-gray-400 text-[10px]">✉️</span>
                                        <span className="text-white font-semibold">{email}</span>
                                        <button
                                          onClick={() => copyToClipboard(email, `Email`)}
                                          className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white rounded transition"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    )}
                                    {phone && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-gray-400 text-[10px]">📱</span>
                                        <span className="text-emerald-400 font-semibold">{phone}</span>
                                        <button
                                          onClick={() => copyToClipboard(phone, `Phone`)}
                                          className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded transition"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    )}
                                    {!email && !phone && (
                                      <div className="flex items-center gap-1.5">
                                        <span>{identifier}</span>
                                        <button
                                          onClick={() => copyToClipboard(identifier, `Identifier`)}
                                          className="text-[10px] px-1.5 py-0.5 bg-white/10 hover:bg-blue-600 text-white rounded transition"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="py-3 px-4 font-mono text-amber-300 font-bold">
                                  <div className="flex items-center gap-1.5">
                                    <span className="bg-amber-500/10 px-2 py-0.5 rounded">
                                      {item.password || '—'}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(item.password || '', `Password`)}
                                      className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-black rounded transition font-medium"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-gray-400">
                                  {item.promo_code && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] mr-1 font-mono">
                                      {item.promo_code}
                                    </span>
                                  )}
                                  {item.currency && (
                                    <span className="text-[10px] text-gray-400 font-mono">{item.currency}</span>
                                  )}
                                  {!item.promo_code && !item.currency && '—'}
                                </td>

                                <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                                  {item.ip_address || '—'}
                                </td>

                                <td className="py-3 px-4 text-gray-400 text-[11px]">
                                  <div className="font-medium text-white">{formatTimeAgo(item.created_at)}</div>
                                  <div className="text-[10px] text-gray-500">
                                    {item.created_at ? new Date(item.created_at).toLocaleTimeString() : '—'}
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-right">
                                  <button
                                    onClick={() => copyToClipboard(combo, `Combo (${combo})`)}
                                    className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-200 hover:text-white rounded-lg text-[11px] font-bold transition shadow-sm"
                                  >
                                    Copy Combo
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 2: SMART TEXT & PATTERN EXTRACTOR TOOL                         */}
        {/* ================================================================== */}
        {activeTab === 'text-extractor' && (
          <div className="space-y-6">
            <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 space-y-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Smart Text & Pattern Extractor</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                  Universal Tool
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Paste any unstructured text, dump file, chat transcript, or logs to instantly extract credentials, phone numbers, emails, or links.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Area */}
              <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Raw Input Text</span>
                  <button
                    onClick={() => setRawText('')}
                    className="text-xs text-gray-500 hover:text-rose-400 transition"
                  >
                    Clear Input
                  </button>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste raw text here... e.g.:&#10;User user@domain.com with pass secret123 logged in from +919876543210..."
                  rows={14}
                  className="w-full flex-1 bg-[#181d2e] border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none transition"
                />

                {/* Extraction Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => runExtraction('combos')}
                    className="py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
                  >
                    Extract Combos
                  </button>
                  <button
                    onClick={() => runExtraction('emails')}
                    className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition"
                  >
                    Extract Emails
                  </button>
                  <button
                    onClick={() => runExtraction('phones')}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition"
                  >
                    Extract Phones
                  </button>
                  <button
                    onClick={() => runExtraction('urls')}
                    className="py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow transition"
                  >
                    Extract URLs
                  </button>
                </div>
              </div>

              {/* Output Results Area */}
              <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Extracted Output
                    </span>
                    {extractedType && (
                      <span className="ml-2 text-xs text-emerald-400 font-medium">({extractedType})</span>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">
                    {extractedResults.length} found
                  </span>
                </div>

                <div className="w-full flex-1 min-h-[300px] bg-[#181d2e] border border-white/10 rounded-xl p-4 text-xs font-mono overflow-y-auto max-h-[400px]">
                  {extractedResults.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500 italic">
                      Results will appear here after extraction.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {extractedResults.map((res, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-1.5 hover:bg-white/5 rounded group"
                        >
                          <span className="text-emerald-300 break-all">{res}</span>
                          <button
                            onClick={() => copyToClipboard(res, 'Item')}
                            className="opacity-0 group-hover:opacity-100 text-[10px] px-2 py-0.5 bg-white/10 hover:bg-blue-600 rounded text-white transition ml-2 shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export Options */}
                {extractedResults.length > 0 && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => copyToClipboard(extractedResults.join('\n'), 'All Extracted Items')}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
                    >
                      Copy All ({extractedResults.length})
                    </button>
                    <button
                      onClick={() =>
                        downloadFile(
                          extractedResults.join('\n'),
                          `extracted_${Date.now()}.txt`,
                          'text/plain'
                        )
                      }
                      className="px-3 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition"
                    >
                      Download .TXT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* TAB 3: ADMIN CONTROL & ACTIVE USER MONITOR (Admin Only)           */}
        {/* ================================================================== */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-medium">Currently Active Users</div>
                  <div className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                    <span>{adminStats.onlineUsers}</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl font-bold">
                  🟢
                </div>
              </div>

              <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-medium">Total Registered UIDs</div>
                  <div className="text-2xl font-bold text-white mt-1">{adminStats.totalUsers}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl font-bold">
                  👥
                </div>
              </div>

              <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400 font-medium">Marketing Credentials Allowed</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {adminStats.marketingAllowedCount}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-xl font-bold">
                  🔑
                </div>
              </div>
            </div>

            {/* User Management & Device Security Controls */}
            <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>UIDs & Device Enforcement Control</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">
                      Live Heartbeat Monitored
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Toggle marketing credentials permission, lock UID to a specific device, or terminate sessions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition flex items-center gap-1.5"
                  >
                    <span>+</span>
                    <span>Add New UID</span>
                  </button>
                  <button
                    onClick={fetchAdminData}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs transition"
                    title="Refresh Now"
                  >
                    🔄
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">UID / Name</th>
                      <th className="py-3 px-4">Active Device (Online)</th>
                      <th className="py-3 px-4">Marketing Credentials Access</th>
                      <th className="py-3 px-4">Device Lock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4">
                          {u.is_online ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-400 text-[10px] font-medium border border-gray-500/20">
                              OFFLINE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="font-mono text-blue-400">{u.uid}</span>
                            <span className="text-gray-400 font-normal">({u.name})</span>
                          </div>
                          <div className="text-[10px] text-gray-500">Role: {u.role}</div>
                        </td>
                        <td className="py-3 px-4">
                          {u.active_device_name ? (
                            <div>
                              <div className="text-white font-medium flex items-center gap-1.5">
                                <span>📱</span>
                                <span>{u.active_device_name}</span>
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono">
                                IP: {u.last_ip || 'unknown'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">No active session</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleMarketing(u.uid, u.can_access_marketing)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                              u.can_access_marketing
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                            }`}
                          >
                            <span>{u.can_access_marketing ? '✓ Allowed' : '✕ Denied'}</span>
                            <span className="text-[10px] opacity-70">(click to toggle)</span>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleDeviceLock(u.uid, Boolean(u.device_lock_enabled))}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                              u.device_lock_enabled
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <span>{u.device_lock_enabled ? '🔒 Locked' : '🔓 Flexible'}</span>
                            <span className="text-[10px] opacity-70">
                              {u.device_lock_enabled ? 'Specific Device' : 'Auto-switch'}
                            </span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {u.active_session_token && (
                            <button
                              onClick={() => handleForceLogout(u.uid)}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg text-[11px] font-medium transition"
                            >
                              Force Logout
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real-time Activity Logs Feed */}
            <div className="bg-[#121624] border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Live Activity & Device Switch Audit Feed</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                      Audit Trail
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Real-time notifications of user logins, device switches, and access enforcement events.
                  </p>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-white/5">
                {adminLogs.map((log) => {
                  let badgeBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                  if (log.event_type === 'DEVICE_SWITCH') badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  if (log.event_type === 'ACCESS_DENIED') badgeBg = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                  if (log.event_type === 'ADMIN_ACTION') badgeBg = 'bg-purple-500/20 text-purple-300 border-purple-500/30';

                  return (
                    <div key={log.id} className="pt-2 flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
                            {log.event_type}
                          </span>
                          <span className="font-mono font-bold text-white">{log.uid}</span>
                          <span className="text-gray-400">{log.details}</span>
                        </div>
                        {log.device_name && (
                          <div className="text-[11px] text-gray-500 font-mono">
                            Device: {log.device_name} | IP: {log.ip_address || 'unknown'}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-500 shrink-0 font-mono">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE NEW USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141824] border border-white/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New User UID</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-300">Unique UID</label>
                  <button
                    type="button"
                    onClick={() => setNewUid('AGENT-' + Math.floor(1000 + Math.random() * 9000))}
                    className="text-blue-400 hover:underline"
                  >
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  value={newUid}
                  onChange={(e) => setNewUid(e.target.value)}
                  placeholder="e.g. AGENT-501 or marketing_lead"
                  required
                  className="w-full bg-[#181d2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Full Name / Agent Label</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full bg-[#181d2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Default: password123"
                  className="w-full bg-[#181d2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
                    className="w-full bg-[#181d2e] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="user">User / Agent</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 bg-white/5 rounded-xl cursor-pointer border border-white/5">
                    <input
                      type="checkbox"
                      checked={newAllowMarketing}
                      onChange={(e) => setNewAllowMarketing(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="text-gray-300 text-[11px] font-medium">Allow Marketing Access</span>
                  </label>
                </div>
              </div>

              {modalError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  {modalError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow transition"
                >
                  Create UID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

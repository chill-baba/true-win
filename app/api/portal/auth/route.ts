import { NextRequest, NextResponse } from 'next/server';
import { loginUser, logoutUser } from '@/lib/portal-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, password, deviceId, deviceName } = body;

    if (!uid || !deviceId) {
      return NextResponse.json(
        { ok: false, error: 'MISSING_FIELDS', message: 'UID and Device ID are required.' },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const result = await loginUser({
      uid: String(uid).trim(),
      password: password ? String(password) : undefined,
      deviceId: String(deviceId).trim(),
      deviceName: deviceName ? String(deviceName).trim() : 'Web Client',
      ip,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, token } = body;
    if (uid) {
      await logoutUser(uid, token);
    }
    return NextResponse.json({ ok: true, logged_out: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

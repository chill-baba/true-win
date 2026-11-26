import { NextRequest, NextResponse } from 'next/server';
import { verifyAndHeartbeat } from '@/lib/portal-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, token, deviceId } = body;

    if (!uid || !token || !deviceId) {
      return NextResponse.json(
        { valid: false, reason: 'INVALID_PARAMETERS', message: 'UID, token, and deviceId are required.' },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const check = await verifyAndHeartbeat({
      uid: String(uid).trim(),
      token: String(token).trim(),
      deviceId: String(deviceId).trim(),
      ip,
    });

    if (!check.valid) {
      // 403 Forbidden signals the client to immediately terminate session & show alert
      return NextResponse.json(check, { status: 403 });
    }

    return NextResponse.json(check);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ valid: false, error: message }, { status: 500 });
  }
}

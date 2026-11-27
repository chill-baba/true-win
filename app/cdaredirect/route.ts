import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Handles /cdaredirect locally so Next.js fallback rewrites do not forward it
 * to 1win.in/openresty (which responds with 400 Bad Request).
 */
function handleCdaRedirect(request: NextRequest) {
  const dest = request.headers.get('sec-fetch-dest');

  if (dest === 'iframe') {
    return NextResponse.redirect(
      new URL('/api/proxy?url=' + encodeURIComponent('https://1win.in'), request.url),
      302
    );
  }

  if (dest === 'document') {
    return NextResponse.redirect(new URL('/', request.url), 302);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET(request: NextRequest) {
  return handleCdaRedirect(request);
}

export async function POST(request: NextRequest) {
  return handleCdaRedirect(request);
}

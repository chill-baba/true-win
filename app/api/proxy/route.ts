import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE = 'https://1win.in';

const CSP_HEADER = [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:",
  "style-src 'self' 'unsafe-inline' * data: blob:",
  "img-src 'self' * data: blob:",
  "font-src 'self' * data: blob:",
  "connect-src 'self' * ws: wss:",
  "frame-src 'self' *",
  "media-src 'self' * data: blob:",
  "object-src 'none'",
].join("; ");

function rewriteUrls(html: string, base: string): string {
  // Rewrite absolute URLs of the same origin
  html = html.replace(
    /https?:\/\/1win\.in/g,
    '/api/proxy?url=https://1win.in'
  );

  // Rewrite href="/ and src="/ to go through proxy
  html = html.replace(
    /(href|src|action)=["']\//g,
    `$1="/api/proxy?url=${encodeURIComponent(base)}/`
  );

  return html;
}

const FETCH_INTERCEPTOR = `
<script>
(function() {
  var BASE = 'https://1win.in';
  function toProxyUrl(url) {
    if (typeof url !== 'string') return url;
    if (url.startsWith('/api/proxy?url=')) return url;
    if (url.startsWith(BASE)) {
      return '/api/proxy?url=' + encodeURIComponent(url);
    }
    if (url.startsWith('/') && !url.startsWith('//')) {
      return '/api/proxy?url=' + encodeURIComponent(BASE + url);
    }
    return url;
  }

  var origFetch = window.fetch;
  window.fetch = function(input, init) {
    if (typeof input === 'string') {
      input = toProxyUrl(input);
    } else if (input instanceof Request) {
      var proxied = toProxyUrl(input.url);
      if (proxied !== input.url) {
        input = new Request(proxied, input);
      }
    }
    return origFetch.call(this, input, init);
  };

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string') {
      arguments[1] = toProxyUrl(url);
    }
    return origOpen.apply(this, arguments);
  };
})();
</script>
`;

const BRIDGE_SCRIPT = `
<script>
(function() {
  function handleAuthClick(e) {
    var target = e.target;
    while (target && target !== document.body) {
      if (target.getAttribute && target.getAttribute('data-testid') === 'game-play-card-auth-button') {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        window.parent.postMessage('open-login-modal', '*');
        return;
      }
      var txt = (target.textContent || '').trim().toLowerCase();
      var tag = target.tagName ? target.tagName.toUpperCase() : '';
      var role = target.getAttribute ? target.getAttribute('role') : '';
      if (tag === 'BUTTON' || tag === 'A' || role === 'button') {
        if (txt === 'log in' || txt === 'login') {
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          window.parent.postMessage('open-login-modal', '*');
          return;
        }
        if (txt === 'registration' || txt === 'register') {
          e.preventDefault();
          e.stopPropagation();
          if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
          window.parent.postMessage('open-register-modal', '*');
          return;
        }
      }
      target = target.parentElement;
    }
  }
  document.addEventListener('click', handleAuthClick, true);
})();
</script>
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url') || BASE;

  // Only allow proxying 1win.in resources
  if (!targetUrl.startsWith('https://1win.in') && !targetUrl.startsWith('http://1win.in')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        Referer: BASE,
      },
      redirect: 'follow',
    });

    const contentType = upstream.headers.get('content-type') || '';

    // For HTML – rewrite URLs and strip frame-blocking / restrictive CSP meta tags
    if (contentType.includes('text/html')) {
      let body = await upstream.text();
      body = body.replace(
        /<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/gi,
        ''
      );
      body = rewriteUrls(body, BASE);

      // Inject fetch/XHR interceptor at the top of <head> (without <base> so module scripts don't bypass proxy and hit CORS)
      body = body.replace(
        /<head([^>]*)>/i,
        `<head$1>${FETCH_INTERCEPTOR}`
      );

      // Inject the postMessage bridge script before </body>
      if (body.includes('</body>')) {
        body = body.replace('</body>', `${BRIDGE_SCRIPT}</body>`);
      } else {
        body += BRIDGE_SCRIPT;
      }

      return new NextResponse(body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
          'Content-Security-Policy': CSP_HEADER,
        },
      });
    }

    // For JavaScript – rewrite relative ES module imports and Vite preload arrays so they route through /api/proxy
    if (contentType.includes('javascript') || targetUrl.endsWith('.js') || targetUrl.endsWith('.mjs')) {
      let js = await upstream.text();
      js = js.replace(
        /(["'`])((?:\.\.?\/|\/resources\/)[^"'`\s]+\.(?:m?js|css)(?:\?[^"'`\s]*)?)(\1)/g,
        (_match, quote, relPath) => {
          try {
            const resolved = new URL(relPath, targetUrl).href;
            return `${quote}/api/proxy?url=${encodeURIComponent(resolved)}${quote}`;
          } catch {
            return _match;
          }
        }
      );

      return new NextResponse(js, {
        status: upstream.status,
        headers: {
          'Content-Type': contentType || 'application/javascript; charset=utf-8',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'Content-Security-Policy': CSP_HEADER,
        },
      });
    }

    // For everything else (CSS, images, fonts) – pipe through as-is
    const buffer = await upstream.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=86400');
    // Allow cross-origin so the browser can use these resources
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Content-Security-Policy', CSP_HEADER);

    return new NextResponse(buffer, {
      status: upstream.status,
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Proxy error: ${message}`, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url') || BASE;

  if (!targetUrl.startsWith('https://1win.in') && !targetUrl.startsWith('http://1win.in')) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const reqBody = await request.arrayBuffer();
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': request.headers.get('content-type') || 'application/json',
        Accept: request.headers.get('accept') || '*/*',
        Origin: BASE,
        Referer: BASE,
      },
      body: reqBody,
      redirect: 'follow',
    });

    const buffer = await upstream.arrayBuffer();
    const headers = new Headers();
    headers.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(buffer, {
      status: upstream.status,
      headers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Proxy error: ${message}`, { status: 502 });
  }
}

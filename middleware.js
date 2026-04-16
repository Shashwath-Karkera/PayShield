import { NextResponse } from 'next/server';

const locales = ['en', 'hi', 'kn'];
const localizedRoutes = new Set([
  '/login',
  '/register',
  '/verify',
  '/dashboard',
  '/payment',
  '/bank-credentials',
  '/security',
  '/threat',
  '/about',
  '/features',
  '/contact'
]);

export async function middleware(request) {
  const { pathname, searchParams } = request.nextUrl;
  const ip = request.ip || request.headers.get("x-forwarded-for") || "192.168.1.150";

  // 🛡️ PAYSHIELD ACTIVE DEFENSE INTERCEPTOR 🛡️
  const maliciousPatterns = [
    /union|select.*from|insert.*into|update.*set|delete.*from|drop.*table|truncate.*table/i, // SQLi Expanded
    /['"]\s*OR\s*['"]?1['"]?\s*=\s*['"]?1/i, // Classical SQLi
    /<script[^>]*>.*?<\/script>/i, // XSS
    /etc\/passwd/i, // LFI
    /cmd=|\/bin\/bash/i // RCE
  ];

  let rawBody = "";
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      const clonedReq = request.clone();
      rawBody = await clonedReq.text();
    } catch(e) {}
  }

  const urlQuery = decodeURIComponent(searchParams.toString());
  const urlPath = decodeURIComponent(pathname);
  const userAgent = request.headers.get('user-agent') || '';
  const combinedPayload = `${urlQuery} ${urlPath} ${userAgent} ${rawBody}`;

  const isMalicious = maliciousPatterns.some(p => p.test(combinedPayload));

  if (isMalicious) {
    let attackType = "Unknown Anomaly";
    if (/union|select|insert|update|delete|drop|truncate/i.test(combinedPayload) || /OR\s*['"]?1/i.test(combinedPayload)) attackType = "SQL Injection";
    else if (/<script/i.test(combinedPayload)) attackType = "Cross-Site Scripting (XSS)";
    else if (/etc\/passwd|cmd=/i.test(combinedPayload)) attackType = "Remote Code Execution / Traversal";

    // Async record logging - await ensures Edge worker doesn't die before fetch completes
    const origin = request.nextUrl.origin;
    await fetch(`${origin}/api/security/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: attackType, ip, route: pathname, metadata: combinedPayload.substring(0, 100) })
    }).catch(() => {});

    return NextResponse.json({ 
      error: "🚨 PAYSHIELD ACTIVE DEFENSE MECHANISM TRIGGERED 🚨",
      message: `Your IP ${ip} has been flagged for executing a ${attackType} vector. Access is blocked for 24 hours. Forensic data collected.`
    }, { status: 403 });
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    /\.[^/]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/en';
    return NextResponse.redirect(url);
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (hasLocale) {
    return NextResponse.next();
  }

  if (localizedRoutes.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};

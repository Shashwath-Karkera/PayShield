import { NextResponse } from 'next/server';

const locales = ['en', 'hi', 'kn'];
const localizedRoutes = new Set([
  '/login',
  '/register',
  '/verify',
  '/dashboard',
  '/payment',
  '/transactions',
  '/profile',
  '/settings',
  '/bank-credentials',
  '/security',
  '/threat',
  '/about',
  '/features',
  '/contact'
]);

export function middleware(request) {
  const { pathname } = request.nextUrl;

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

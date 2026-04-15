import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { verifyToken } from '@/lib/auth/utils';

let locales = ["en", "hi", "kn"];
let defaultLocale = "en";

function getLocale(request) {
  const headers = new Headers(request.headers);
  const acceptLanguage = headers.get("accept-language");
  if (acceptLanguage) {
    headers.set("accept-language", acceptLanguage.replaceAll("_", "-"));
  }

  const headersObject = Object.fromEntries(headers.entries());
  const languages = new Negotiator({ headers: headersObject }).languages();
  return match(languages, locales, defaultLocale);
}

function isProtectedPath(pathname) {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/payment') || pathname.startsWith('/profile');
}

function isAuthPath(pathname) {
  return pathname.startsWith('/login') || pathname.startsWith('/register');
}

export function proxy(request) {
  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];

  if (isProtectedPath(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (token && isAuthPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, static files, favicon, etc.)
    '/((?!_next|api|favicon.ico|[\\w-]+\\.\\w+).*)',
  ],
};
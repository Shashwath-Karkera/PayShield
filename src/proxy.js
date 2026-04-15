<<<<<<< HEAD
import { NextResponse } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

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

export default function middleware(request) {
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
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, static files, favicon, etc.)
    '/((?!_next|api|favicon.ico|[\\w-]+\\.\\w+).*)',
  ],
=======
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/utils';

export function proxy(request) {
  // Check for token in cookies OR Authorization header
  let token = request.cookies.get('token')?.value || 
              request.headers.get('Authorization')?.split(' ')[1];
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register');
  
  // Allow dashboard access without token check for now (for testing)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }
  
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token && !isAuthPage) {
    const decoded = verifyToken(token);
    if (!decoded && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/payment/:path*', '/profile/:path*'],
>>>>>>> 618203f (Added authentication with email and sms)
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_LANGUAGES = ["vi", "en", "zh"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if pathname starts with a supported language prefix (e.g. /vi, /en, /zh)
  const pathnameHasLocale = PUBLIC_LANGUAGES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Do not redirect internal Next.js assets, API requests, admin dashboard, or login
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/ns-admin-portal-2026") ||
    pathname.startsWith("/ns-login-portal-2026") ||
    pathname.includes(".") // matches files like favicon.ico, images, etc.
  ) {
    return;
  }

  // Resolve language from 'lang' cookie or browser's Accept-Language header
  let lang = "vi";
  const cookieLang = request.cookies.get("lang")?.value;
  if (cookieLang && PUBLIC_LANGUAGES.includes(cookieLang)) {
    lang = cookieLang;
  } else {
    const acceptLang = request.headers.get("accept-language");
    if (acceptLang) {
      if (acceptLang.includes("en")) lang = "en";
      else if (acceptLang.includes("zh") || acceptLang.includes("cn")) lang = "zh";
    }
  }

  // Redirect to localized path (e.g. /en/products)
  request.nextUrl.pathname = `/${lang}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

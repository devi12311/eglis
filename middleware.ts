import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always"
});

export default function middleware(request: NextRequest) {
  const [, locale, first, second] = request.nextUrl.pathname.split("/");
  const isAdmin = first === "admin";
  const isLogin = isAdmin && second === "login";

  if (isAdmin && !isLogin) {
    const hasSession = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") || cookie.name.includes("auth-token"));
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale || defaultLocale}/admin/login`;
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|sq|it)/:path*"]
};

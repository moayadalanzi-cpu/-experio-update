import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const isLogin = url.pathname.startsWith("/login");

  const hasAuthCookie =
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb:token") ||
    req.cookies.get("supabase-auth-token");

  // إذا ما مسجل دخول ومو داخل صفحة login → حوله للوجن
  if (!hasAuthCookie && !isLogin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // إذا مسجل دخول وحاول يدخل login → رجعه للهوم
  if (hasAuthCookie && isLogin) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

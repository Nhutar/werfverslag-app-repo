import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/toegang")) return NextResponse.next();

  const auth = request.cookies.get("site-auth")?.value;
  if (auth === process.env.SITE_PASSWORD) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/toegang";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

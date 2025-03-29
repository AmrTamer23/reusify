import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isAuthenticated = request.cookies.has(
    process.env.NODE_ENV === "development"
      ? "reusify.session_token"
      : "__Secure-reusify.session_token"
  );

  const authRoutes = ["/login", "/register"];

  const protectedRoutes = ["/new", "/snippet", "/search"];

  if (
    protectedRoutes.some((route) => path.startsWith(route)) &&
    !isAuthenticated
  ) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (authRoutes.includes(path) && isAuthenticated) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

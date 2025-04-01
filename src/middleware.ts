import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check for session cookie
  const sessionCookie = request.cookies.get(
    process.env.NODE_ENV === "development"
      ? "reusify.session_token"
      : "__Secure-reusify.session_token"
  );

  const isAuthenticated = !!sessionCookie?.value;

  const authRoutes = ["/login", "/register"];
  const protectedRoutes = ["/new", "/snippet", "/search"];

  // Redirect to login if accessing protected routes without authentication
  if (
    protectedRoutes.some((route) => path.startsWith(route)) &&
    !isAuthenticated
  ) {
    const redirectUrl = new URL(
      `/login?redirectTo=${encodeURIComponent(path)}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to home if accessing auth routes while already authenticated
  if (authRoutes.includes(path) && isAuthenticated) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all routes except static assets and API routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

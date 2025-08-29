import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect activation links to setup-password page while preserving token
  if (pathname.startsWith("/api/v1/user/activate")) {
    const url = new URL("/setup-password", request.url);
    const token = request.nextUrl.searchParams.get("token");
    if (token) url.searchParams.set("token", token);
    return NextResponse.redirect(url);
  }

  // Redirect reset-password API link to setup-password page while preserving token
  if (pathname.startsWith("/api/v1/user/reset-password")) {
    const url = new URL("/setup-password", request.url);
    const token = request.nextUrl.searchParams.get("token");
    if (token) url.searchParams.set("token", token);
    return NextResponse.redirect(url);
  }

  // Check if user is trying to access protected routes
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/partners") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/home-images") ||
    pathname.startsWith("/news-activities");

  // Check if user is trying to access login page
  const isLoginPage = pathname === "/login";

  // Get authentication status from cookies (or headers)
  const isAuthenticated =
    request.cookies.get("isAuthenticated")?.value === "true";

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Add cache control headers to prevent excessive requests
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // If accessing login page while authenticated, redirect to dashboard
  if (isLoginPage && isAuthenticated) {
    const response = NextResponse.redirect(new URL("/", request.url));
    // Add cache control headers to prevent excessive requests
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // For authenticated requests to protected routes, add cache control
  if (isProtectedRoute && isAuthenticated) {
    const response = NextResponse.next();
    // Add cache control to prevent excessive re-requests
    response.headers.set("Cache-Control", "private, max-age=60");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ensure activation link goes through middleware for redirect
    "/api/v1/user/activate",
    "/api/v1/user/reset-password",
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

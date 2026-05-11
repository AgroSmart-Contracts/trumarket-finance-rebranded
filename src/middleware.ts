import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseToken } from "./lib/helpers";

export function middleware(request: NextRequest) {
  const authPaths = ["/login"]; // Only redirect from login page when authenticated
  const protectedPaths = ["/profile"]; // Only profile requires authentication
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;
  const authJWT = request.cookies.get("jwt");
  const timeNow = Date.now() / 1000;

  // Allow API routes, static files, and Next.js internals
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon.ico")
  ) {
    return response;
  }

  if (authJWT?.value) {
    const jwtInfo = parseToken(authJWT.value);

    // Check if token is expired
    if (jwtInfo && typeof jwtInfo.exp === 'number' && timeNow > jwtInfo.exp) {
      const redirectResponse = NextResponse.redirect(
        new URL("/login", request.url)
      );
      // Delete the expired token cookie
      redirectResponse.cookies.delete("jwt");
      return redirectResponse;
    }

    // Redirect authenticated users from login page to profile
    // Note: Allow authenticated users to view deals on home page and shipment pages
    if (authPaths.includes(path)) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }
  } else {
    // Unauthenticated users trying to access protected paths should be redirected to login
    // Note: /shipments and / (home) are public and don't require authentication
    if (protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
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

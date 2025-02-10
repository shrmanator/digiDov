import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import thirdwebAuth from "@/lib/thirdwebAuth";

/**
This middleware guarantees that only requests with a valid JWT reach the specified "protected paths".
*/

// Define paths that should be protected (for example, /dashboard)
const protectedPaths = ["/dashboard"];

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  // If the request is not to a protected route, let it through.
  if (!protectedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get the JWT from cookies
  const cookieStore = cookies();
  const jwtCookie = (await cookieStore).get("jwt");

  // If no JWT is present, redirect to login
  if (!jwtCookie?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify the JWT
  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwtCookie.value });
  if (!authResult.valid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If everything is valid, continue to the requested page.
  return NextResponse.next();
}

// Optionally, define a matcher to apply this middleware only to specific routes
export const config = {
  matcher: ["/dashboard/:path*"],
};

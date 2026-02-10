import { NextRequest, NextResponse } from "next/server";

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth for login page, Next.js internals, and static assets
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const expectedLogin = process.env.AUTH_LOGIN;
  const expectedPassword = process.env.AUTH_PASSWORD;

  // If auth is not configured, allow access
  if (!expectedLogin || !expectedPassword) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const expectedToken = await sha256(`${expectedLogin}:${expectedPassword}`);

  if (token !== expectedToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

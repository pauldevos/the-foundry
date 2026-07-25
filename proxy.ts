import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Optimistic auth check only (per Next.js 16 guidance — Proxy replaces what used
// to be called Middleware). This just reads the cookie and redirects; it must
// NOT be the only line of defense. Every route handler that mutates data also
// calls verifySession() from src/lib/session.ts directly.

const COOKIE_NAME = "foundry_session";
const PUBLIC_PATHS = ["/login"];

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const authed = await hasValidSession(token);

  if (!isPublic && !authed) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublic && authed) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

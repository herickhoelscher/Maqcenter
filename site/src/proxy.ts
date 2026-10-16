import { NextResponse, type NextRequest } from "next/server";
import { sessionCookieName, verifySession } from "@/lib/session-token";

// Optimistic check: send visitors without a valid staff session to the
// login page. The real check runs again in every admin page and action.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const userId = await verifySession("admin", request.cookies.get(sessionCookieName.admin)?.value);
  if (!userId) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

import { cookies } from "next/headers";
import { sessionCookieName, sessionMaxAge, signSession, verifySession, type SessionKind } from "./session-token";

// Signed session cookies. Two independent kinds: staff (admin panel) and
// customers (store account). Both are httpOnly and carry only the user id.

export async function startSession(kind: SessionKind, userId: string) {
  (await cookies()).set(sessionCookieName[kind], await signSession(kind, userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: sessionMaxAge[kind],
  });
}

export async function endSession(kind: SessionKind) {
  (await cookies()).delete(sessionCookieName[kind]);
}

export async function readSession(kind: SessionKind): Promise<string | null> {
  return verifySession(kind, (await cookies()).get(sessionCookieName[kind])?.value);
}

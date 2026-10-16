import { jwtVerify, SignJWT } from "jose";

// Session tokens (HS256 JWT). Kept free of request APIs so proxy.ts can
// import it.

export type SessionKind = "admin" | "customer";

export const sessionCookieName: Record<SessionKind, string> = { admin: "mc_admin", customer: "mc_cliente" };
export const sessionMaxAge: Record<SessionKind, number> = { admin: 60 * 60 * 12, customer: 60 * 60 * 24 * 30 };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must have at least 32 characters");
  return new TextEncoder().encode(value);
}

export async function signSession(kind: SessionKind, userId: string): Promise<string> {
  return new SignJWT({ kind })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAge[kind]}s`)
    .sign(secret());
}

/** Returns the user id in a valid token of this kind, or null. */
export async function verifySession(kind: SessionKind, token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.kind === kind && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

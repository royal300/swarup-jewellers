import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "sj_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET is missing or too short");
  return new TextEncoder().encode(s);
}

export type Session = { uid: number; username: string };

export async function createSession(session: Session) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function readSession(token?: string): Promise<Session | null> {
  const value = token ?? (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, secret());
    return typeof payload.uid === "number" && typeof payload.username === "string" ? { uid: payload.uid, username: payload.username } : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<Session> {
  const session = await readSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

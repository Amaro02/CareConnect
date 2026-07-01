import { db } from "../db/index";
import { users, sessions } from "../db/schema";
import type { AuthUser } from "./auth";
import { eq, and, gt } from "drizzle-orm";
import { createHash, randomBytes, randomUUID } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const computedHash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return hash === computedHash;
}

function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function nowUnix(): number {
  return Date.now();
}

function sessionExpiryUnix(): number {
  return Date.now() + 7 * 24 * 60 * 60 * 1000;
}

export async function createUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: AuthUser["role"],
  facilityId?: string
): Promise<AuthUser> {
  const id = randomUUID();
  const now = nowUnix();

  await db.insert(users).values({
    id,
    email,
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    role,
    facilityId: facilityId || null,
    phone: null,
    avatarUrl: null,
    isActive: 1,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    email,
    firstName,
    lastName,
    role,
    facilityId: facilityId || null,
  };
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.isActive, 1)))
    .limit(1);

  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as AuthUser["role"],
    facilityId: user.facilityId,
  };
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: number }> {
  const id = randomUUID();
  const token = generateSessionToken();
  const expiresAt = sessionExpiryUnix();
  const now = nowUnix();

  await db.insert(sessions).values({
    id,
    userId,
    token,
    expiresAt,
    createdAt: now,
  });

  return { token, expiresAt };
}

export async function validateSessionToken(token: string): Promise<AuthUser | null> {
  const now = nowUnix();
  const [sessionRow] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)))
    .limit(1);

  if (!sessionRow) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionRow.userId), eq(users.isActive, 1)))
    .limit(1);

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as AuthUser["role"],
    facilityId: user.facilityId,
  };
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}
// Server-only auth helpers for use in server functions
import type { AuthUser } from "./auth";

/**
 * Get the authenticated user by validating a session token.
 */
export async function getAuthUserByToken(token: string): Promise<AuthUser | null> {
  // Dynamic import to avoid client bundling of server-only code
  const { validateSessionToken } = await import("./auth-server");
  return validateSessionToken(token);
}

/**
 * Require authentication. Throws if not authenticated.
 */
export async function requireAuth(token: string): Promise<AuthUser> {
  const user = await getAuthUserByToken(token);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Require a specific role.
 */
export async function requireRole(token: string, role: string): Promise<AuthUser> {
  const user = await requireAuth(token);
  if (user.role !== role) {
    throw new Error("Not authorized");
  }
  return user;
}
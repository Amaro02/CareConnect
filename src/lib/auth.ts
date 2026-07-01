// Client-safe auth types and utilities
// Server-only crypto functions are in auth-server.ts

export type UserRole = "admin" | "teacher" | "parent";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  facilityId: string | null;
}
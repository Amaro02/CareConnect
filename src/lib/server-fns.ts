import { createServerFn } from "@tanstack/react-start";
import type { AuthUser } from "~/lib/auth";

export const login = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    // Dynamic import to keep node:crypto out of client bundle
    const { authenticateUser, createSession } = await import("./auth-server");
    
    const user = await authenticateUser(data.email, data.password);
    if (!user) {
      return { error: "Invalid email or password" };
    }

    const session = await createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        facilityId: user.facilityId,
      },
      sessionToken: session.token,
    };
  });

export const signup = createServerFn({ method: "POST" })
  .validator((data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    facilityId?: string;
  }) => data)
  .handler(async ({ data }) => {
    try {
      const { createUser } = await import("./auth-server");
      
      const user = await createUser(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.role as "admin" | "teacher" | "parent",
        data.facilityId
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          facilityId: user.facilityId,
        },
      };
    } catch (err: any) {
      if (err?.message?.includes("unique")) {
        return { error: "Email already exists" };
      }
      console.error("Signup error:", err);
      return { error: "Internal server error" };
    }
  });

export const logout = createServerFn({ method: "POST" })
  .handler(async () => {
    return { ok: true };
  });

export const getCurrentUser = createServerFn({ method: "GET" })
  .handler(async () => {
    return { user: null as AuthUser | null };
  });
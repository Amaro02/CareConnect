import { createServerFn } from "@tanstack/react-start";
import type { AuthUser } from "~/lib/auth";

export const login = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
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

export const getCurrentUser = createServerFn({ method: "POST" })
  .validator((data: { sessionToken?: string }) => data)
  .handler(async ({ data }) => {
    if (!data.sessionToken) return { user: null as AuthUser | null };
    
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    
    return { user: user || null };
  });

// --- Prize Store ---

export const listPrizes = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; classroomId?: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user) return { error: "Not authenticated", prizes: [] };
    
    const { db } = await import("../db/index");
    const { prizes, classrooms } = await import("../db/schema");
    const { eq, and } = await import("drizzle-orm");
    
    let result;
    if (data.classroomId) {
      result = await db.select().from(prizes).where(and(eq(prizes.classroomId, data.classroomId), eq(prizes.isActive, 1)));
    } else {
      result = await db.select().from(prizes).where(eq(prizes.isActive, 1));
    }
    return { prizes: result };
  });

export const createPrize = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; classroomId: string; name: string; description?: string; pointCost: number; quantity?: number }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user || (user.role !== "teacher" && user.role !== "admin")) 
      return { error: "Not authorized" };
    
    const { db } = await import("../db/index");
    const { prizes } = await import("../db/schema");
    const { randomUUID } = await import("node:crypto");
    
    const id = randomUUID();
    const now = Date.now();
    
    await db.insert(prizes).values({
      id,
      classroomId: data.classroomId,
      name: data.name,
      description: data.description || null,
      pointCost: data.pointCost,
      quantity: data.quantity ?? 1,
      isActive: 1,
      imageUrl: null,
      createdAt: now,
      updatedAt: now,
    });
    
    return { prize: { id, name: data.name, pointCost: data.pointCost, quantity: data.quantity ?? 1 } };
  });

export const updatePrize = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; prizeId: string; name?: string; description?: string; pointCost?: number; quantity?: number; isActive?: number }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user || (user.role !== "teacher" && user.role !== "admin"))
      return { error: "Not authorized" };
    
    const { db } = await import("../db/index");
    const { prizes } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.pointCost !== undefined) updates.pointCost = data.pointCost;
    if (data.quantity !== undefined) updates.quantity = data.quantity;
    if (data.isActive !== undefined) updates.isActive = data.isActive;
    
    await db.update(prizes).set(updates).where(eq(prizes.id, data.prizeId));
    return { ok: true };
  });

export const deletePrize = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; prizeId: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user || (user.role !== "teacher" && user.role !== "admin"))
      return { error: "Not authorized" };
    
    const { db } = await import("../db/index");
    const { prizes } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.update(prizes).set({ isActive: 0, updatedAt: Date.now() }).where(eq(prizes.id, data.prizeId));
    return { ok: true };
  });

export const redeemPrize = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; prizeId: string; studentId: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user || (user.role !== "teacher" && user.role !== "admin"))
      return { error: "Not authorized" };
    
    const { db } = await import("../db/index");
    const { prizes, prizeRedemptions, students } = await import("../db/schema");
    const { eq, sql } = await import("drizzle-orm");
    const { randomUUID } = await import("node:crypto");
    
    // Check prize exists and has quantity
    const [prize] = await db.select().from(prizes).where(eq(prizes.id, data.prizeId)).limit(1);
    if (!prize || prize.quantity < 1) return { error: "Prize unavailable" };
    
    // Check student has enough points
    const [student] = await db.select().from(students).where(eq(students.id, data.studentId)).limit(1);
    if (!student) return { error: "Student not found" };
    if (student.points < prize.pointCost) return { error: "Not enough points" };
    
    // Deduct points and decrement quantity
    await db.update(students).set({ points: student.points - prize.pointCost, updatedAt: Date.now() }).where(eq(students.id, data.studentId));
    await db.update(prizes).set({ quantity: prize.quantity - 1, updatedAt: Date.now() }).where(eq(prizes.id, data.prizeId));
    
    // Record redemption
    await db.insert(prizeRedemptions).values({
      id: randomUUID(),
      prizeId: data.prizeId,
      studentId: data.studentId,
      redeemedAt: Date.now(),
    });
    
    return { ok: true };
  });

export const getClassrooms = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user) return { error: "Not authenticated", classrooms: [] };
    
    const { db } = await import("../db/index");
    const { classrooms } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    let result;
    if (user.role === "teacher") {
      result = await db.select().from(classrooms).where(eq(classrooms.teacherId, user.id));
    } else if (user.role === "admin") {
      result = await db.select().from(classrooms).where(eq(classrooms.facilityId, user.facilityId!));
    } else {
      result = [];
    }
    return { classrooms: result };
  });

export const getStudents = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; classroomId: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user) return { error: "Not authenticated", students: [] };
    
    const { db } = await import("../db/index");
    const { students } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    const result = await db.select().from(students).where(eq(students.classroomId, data.classroomId));
    return { students: result };
  });

// --- Photo Gallery ---

export const getChildReports = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user || user.role !== "parent") return { error: "Not authorized", reports: [], students: [] };
    
    const { db } = await import("../db/index");
    const { students, dailyReports, reportPhotos, classrooms } = await import("../db/schema");
    const { eq, and, desc } = await import("drizzle-orm");
    
    // Get parent's children
    const parentStudents = await db.select().from(students).where(eq(students.parentId, user.id));
    
    // Get reports for their classrooms
    const classroomIds = [...new Set(parentStudents.map(s => s.classroomId))];
    const reports: any[] = [];
    
    for (const cId of classroomIds) {
      const classReports = await db.select()
        .from(dailyReports)
        .where(and(eq(dailyReports.classroomId, cId), eq(dailyReports.status, "sent")))
        .orderBy(desc(dailyReports.date))
        .limit(20);
      
      for (const report of classReports) {
        const photos = await db.select().from(reportPhotos).where(eq(reportPhotos.reportId, report.id));
        const [classroom] = await db.select().from(classrooms).where(eq(classrooms.id, cId)).limit(1);
        reports.push({ ...report, photos, classroomName: classroom?.name });
      }
    }
    
    return { reports, students: parentStudents };
  });

// --- Messaging ---

export const sendMessage = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; recipientId: string; subject?: string; body: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user) return { error: "Not authenticated" };
    
    const { db } = await import("../db/index");
    const { messages } = await import("../db/schema");
    const { randomUUID } = await import("node:crypto");
    
    await db.insert(messages).values({
      id: randomUUID(),
      senderId: user.id,
      recipientId: data.recipientId,
      subject: data.subject || null,
      body: data.body,
      isRead: 0,
      parentId: null,
      createdAt: Date.now(),
    });
    
    return { ok: true };
  });

export const getMessages = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string }) => data)
  .handler(async ({ data }) => {
    const { validateSessionToken } = await import("./auth-server");
    const user = await validateSessionToken(data.sessionToken);
    if (!user) return { error: "Not authenticated", messages: [] };
    
    const { db } = await import("../db/index");
    const { messages, users } = await import("../db/schema");
    const { eq, or, desc } = await import("drizzle-orm");
    
    const msgs = await db.select()
      .from(messages)
      .where(or(eq(messages.senderId, user.id), eq(messages.recipientId, user.id)))
      .orderBy(desc(messages.createdAt))
      .limit(50);
    
    // Enrich with sender/recipient names
    const userIds = [...new Set(msgs.flatMap(m => [m.senderId, m.recipientId]))];
    const userRows = await Promise.all(
      userIds.map(uid => db.select().from(users).where(eq(users.id, uid)).limit(1).then(r => r[0]))
    );
    const userMap = Object.fromEntries(userRows.filter(Boolean).map(u => [u.id, u]));
    
    const enriched = msgs.map(m => ({
      ...m,
      senderName: userMap[m.senderId] ? `${userMap[m.senderId].firstName} ${userMap[m.senderId].lastName}` : "Unknown",
      recipientName: userMap[m.recipientId] ? `${userMap[m.recipientId].firstName} ${userMap[m.recipientId].lastName}` : "Unknown",
    }));
    
    return { messages: enriched };
  });

export const markMessageRead = createServerFn({ method: "POST" })
  .validator((data: { sessionToken: string; messageId: string }) => data)
  .handler(async ({ data }) => {
    const { db } = await import("../db/index");
    const { messages } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.update(messages).set({ isRead: 1 }).where(eq(messages.id, data.messageId));
    return { ok: true };
  });
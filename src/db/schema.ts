import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

// --- Tables ---

// Multi-tenant organizations (facilities, schools, districts)
export const facilities = sqliteTable("facilities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  subscriptionTier: text("subscription_tier").notNull().default("trial"), // trial, basic, premium, district
  subscriptionStatus: text("subscription_status").notNull().default("active"), // active, past_due, cancelled
  maxTeachers: integer("max_teachers").notNull().default(5),
  maxStudents: integer("max_students").notNull().default(50),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Users (teachers, parents, admins)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("teacher"), // admin, teacher, parent
  facilityId: text("facility_id").references(() => facilities.id),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Classrooms (linked to facilities)
export const classrooms = sqliteTable("classrooms", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  facilityId: text("facility_id").notNull().references(() => facilities.id),
  teacherId: text("teacher_id").notNull().references(() => users.id),
  ageGroup: text("age_group"), // e.g. "3-4", "5-6", "school-age"
  capacity: integer("capacity"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Students (linked to classrooms, with parent connections)
export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  classroomId: text("classroom_id").notNull().references(() => classrooms.id),
  parentId: text("parent_id").references(() => users.id),
  dateOfBirth: integer("date_of_birth"),
  photoUrl: text("photo_url"),
  points: integer("points").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  notes: text("notes"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Points log (student point awards)
export const pointsLog = sqliteTable("points_log", {
  id: text("id").primaryKey(),
  studentId: text("student_id").notNull().references(() => students.id),
  teacherId: text("teacher_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  reason: text("reason").notNull(),
  category: text("category"), // e.g. "behavior", "academic", "participation"
  awardedAt: integer("awarded_at").notNull(),
});

// Prizes (classroom prize store)
export const prizes = sqliteTable("prizes", {
  id: text("id").primaryKey(),
  classroomId: text("classroom_id").notNull().references(() => classrooms.id),
  name: text("name").notNull(),
  description: text("description"),
  pointCost: integer("point_cost").notNull(),
  quantity: integer("quantity").notNull().default(1),
  imageUrl: text("image_url"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Prize redemptions
export const prizeRedemptions = sqliteTable("prize_redemptions", {
  id: text("id").primaryKey(),
  prizeId: text("prize_id").notNull().references(() => prizes.id),
  studentId: text("student_id").notNull().references(() => students.id),
  redeemedAt: integer("redeemed_at").notNull(),
});

// Daily reports (with photo references)
export const dailyReports = sqliteTable("daily_reports", {
  id: text("id").primaryKey(),
  classroomId: text("classroom_id").notNull().references(() => classrooms.id),
  teacherId: text("teacher_id").notNull().references(() => users.id),
  date: integer("date").notNull(),
  summary: text("summary"),
  mood: text("mood"), // great, good, okay, challenging
  photos: text("photos"), // JSON array of photo URLs stored as text
  status: text("status").notNull().default("draft"), // draft, sent
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// Report photos (separate table for photo metadata)
export const reportPhotos = sqliteTable("report_photos", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull().references(() => dailyReports.id),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: integer("created_at").notNull(),
});

// Daily report entries (per-student notes within a report)
export const reportEntries = sqliteTable("report_entries", {
  id: text("id").primaryKey(),
  reportId: text("report_id").notNull().references(() => dailyReports.id),
  studentId: text("student_id").notNull().references(() => students.id),
  notes: text("notes"),
  mood: text("mood"),
  napTime: text("nap_time"), // for younger kids
  meals: text("meals"),
  activities: text("activities"),
  pointsAwarded: integer("points_awarded").default(0),
});

// Messages (teacher-parent communication)
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull().references(() => users.id),
  recipientId: text("recipient_id").notNull().references(() => users.id),
  subject: text("subject"),
  body: text("body").notNull(),
  isRead: integer("is_read").notNull().default(0),
  parentId: text("parent_id"), // link to parent message for threading
  createdAt: integer("created_at").notNull(),
});

// Sessions (for cookie-based auth)
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
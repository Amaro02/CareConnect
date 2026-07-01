// Seed script for CareConnect — creates test data in the local SQLite database
// Usage: cd /home/team/shared/site && DATABASE_URL=file:./data/careconnect.db npx tsx src/db/seed.ts

import { db } from "./index";
import {
  facilities,
  users,
  classrooms,
  students,
} from "./schema";
import { createHash, randomBytes, randomUUID } from "node:crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return `${salt}:${hash}`;
}

function nowUnix(): number {
  return Date.now();
}

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Create a facility
  const facilityId = randomUUID();
  await db.insert(facilities).values({
    id: facilityId,
    name: "Sunshine Learning Center",
    slug: "sunshine-learning",
    subscriptionTier: "basic",
    subscriptionStatus: "active",
    maxTeachers: 10,
    maxStudents: 100,
    createdAt: nowUnix(),
    updatedAt: nowUnix(),
  });
  console.log(`✓ Created facility: Sunshine Learning Center (${facilityId})`);

  // 2. Create a teacher
  const teacherId = randomUUID();
  await db.insert(users).values({
    id: teacherId,
    email: "teacher@careconnect.app",
    passwordHash: hashPassword("password123"),
    firstName: "Sarah",
    lastName: "Johnson",
    role: "teacher",
    facilityId,
    phone: "555-0101",
    isActive: 1,
    createdAt: nowUnix(),
    updatedAt: nowUnix(),
  });
  console.log(`✓ Created teacher: sarah@careconnect.app / password123`);

  // 3. Create a parent
  const parentId = randomUUID();
  await db.insert(users).values({
    id: parentId,
    email: "parent@careconnect.app",
    passwordHash: hashPassword("password123"),
    firstName: "Michael",
    lastName: "Chen",
    role: "parent",
    facilityId,
    phone: "555-0202",
    isActive: 1,
    createdAt: nowUnix(),
    updatedAt: nowUnix(),
  });
  console.log(`✓ Created parent: parent@careconnect.app / password123`);

  // 4. Create an admin
  const adminId = randomUUID();
  await db.insert(users).values({
    id: adminId,
    email: "admin@careconnect.app",
    passwordHash: hashPassword("password123"),
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    facilityId,
    phone: "555-0000",
    isActive: 1,
    createdAt: nowUnix(),
    updatedAt: nowUnix(),
  });
  console.log(`✓ Created admin: admin@careconnect.app / password123`);

  // 5. Create a classroom
  const classroomId = randomUUID();
  await db.insert(classrooms).values({
    id: classroomId,
    name: "Preschool Room A",
    facilityId,
    teacherId,
    ageGroup: "3-4",
    capacity: 15,
    isActive: 1,
    createdAt: nowUnix(),
    updatedAt: nowUnix(),
  });
  console.log(`✓ Created classroom: Preschool Room A`);

  // 6. Create students
  const studentsData = [
    { firstName: "Emma", lastName: "Chen", parentId },
    { firstName: "Liam", lastName: "Smith", parentId: null as string | null },
    { firstName: "Olivia", lastName: "Williams", parentId: null },
    { firstName: "Noah", lastName: "Brown", parentId: null },
    { firstName: "Ava", lastName: "Davis", parentId: null },
  ];

  for (const s of studentsData) {
    const studentId = randomUUID();
    await db.insert(students).values({
      id: studentId,
      firstName: s.firstName,
      lastName: s.lastName,
      classroomId,
      parentId: s.parentId,
      points: Math.floor(Math.random() * 50),
      isActive: 1,
      createdAt: nowUnix(),
      updatedAt: nowUnix(),
    });
  }
  console.log(`✓ Created ${studentsData.length} students with random points`);

  console.log("\n✅ Seed complete! Test accounts:");
  console.log("   Teacher: teacher@careconnect.app / password123");
  console.log("   Parent:  parent@careconnect.app / password123");
  console.log("   Admin:   admin@careconnect.app / password123");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
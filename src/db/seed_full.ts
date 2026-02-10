import "dotenv/config";
import { db } from "./index";
import { users, academicBatches, classes, subjects, faculty, students } from "./schema";
import { encryptPassword } from "../lib/auth";

async function main() {
    console.log("🌱 Starting full database seed...");

    try {
        const defaultPassword = await encryptPassword("password123");
        const adminPassword = await encryptPassword("admin123");

        // 1. Create Admin
        console.log("Creating Admin...");
        await db.insert(users).values({
            id: "admin-1",
            email: "admin@svr.edu",
            password: adminPassword,
            name: "System Admin",
            role: "admin",
            isActive: true,
        }).onConflictDoNothing();

        // 2. Create Academic Batch
        console.log("Creating Batches...");
        const batchId = "batch-2023-2027";
        await db.insert(academicBatches).values({
            id: batchId,
            name: "2023 - 2027",
            startDate: new Date("2023-01-01"),
            endDate: new Date("2027-12-31"),
            isActive: true,
        }).onConflictDoNothing();

        // 3. Create Classes
        console.log("Creating Classes...");
        const classAId = "class-a";
        await db.insert(classes).values({ id: classAId, name: "Section A", batchId: batchId }).onConflictDoNothing();
        const classBId = "class-b";
        await db.insert(classes).values({ id: classBId, name: "Section B", batchId: batchId }).onConflictDoNothing();
        const classCId = "class-c";
        await db.insert(classes).values({ id: classCId, name: "Section C", batchId: batchId }).onConflictDoNothing();

        // 4. Create Subjects
        console.log("Creating Subjects...");
        const subjectId = "sub-ai-theory";
        await db.insert(subjects).values({
            id: subjectId,
            name: "Artificial Intelligence",
            code: "AI-101",
            type: "theory",
            credits: 3,
            batchId: batchId,
            semester: "1-1",
        }).onConflictDoNothing();

        // 5. Create 15 Faculty Members
        console.log("Creating 15 Faculty Members...");
        const departments = ["AI", "CSE", "ECE", "MECH"];

        for (let i = 1; i <= 15; i++) {
            const facId = `fac-user-${i}`;
            const email = `faculty${i}@svr.edu`;
            const name = `Faculty Member ${i}`;

            await db.insert(users).values({
                id: facId,
                email: email,
                password: defaultPassword,
                name: name,
                role: "faculty",
                isActive: true,
            }).onConflictDoNothing();

            await db.insert(faculty).values({
                id: `fac-profile-${i}`,
                userId: facId,
                designation: i <= 5 ? "Professor" : "Assistant Professor",
                department: departments[i % departments.length],
                employeeId: `EMP${1000 + i}`,
            }).onConflictDoNothing();
        }

        // 6. Create Student
        console.log("Creating Student...");
        const studentUserId = "stu-user-1";
        await db.insert(users).values({
            id: studentUserId,
            email: "student@svr.edu",
            password: defaultPassword,
            name: "John Student",
            role: "student",
            isActive: true,
        }).onConflictDoNothing();

        await db.insert(students).values({
            id: "stu-1",
            userId: studentUserId,
            registerNumber: "23AI01",
            batchId: batchId,
            classId: classAId, // Assigned to Section A
            currentSemester: "1-1",
        }).onConflictDoNothing();

        console.log("✅ Seeding complete!");
        console.log("--------------------------------");
        console.log("Admin:   admin@svr.edu / admin123");
        console.log("Faculty: faculty1@svr.edu to faculty15@svr.edu / password123");
        console.log("Student: student@svr.edu / password123");
        console.log("--------------------------------");

        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

main();

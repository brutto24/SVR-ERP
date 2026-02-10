
import { db } from "./src/db";
import { facultySubjects, faculty, subjects, classes, users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking faculty assignments integrity...");

    // 1. Get raw assignments
    const rawAssignments = await db.select().from(facultySubjects).execute();
    console.log(`Total Raw Records in faculty_subjects: ${rawAssignments.length}`);

    for (const assign of rawAssignments) {
        // Check Faculty
        const f = await db.select().from(faculty).where(eq(faculty.id, assign.facultyId)).execute();
        // Check Subject
        const s = await db.select().from(subjects).where(eq(subjects.id, assign.subjectId)).execute();
        // Check Class
        const c = await db.select().from(classes).where(eq(classes.id, assign.classId)).execute();

        const status = [];
        if (f.length === 0) status.push("Missing Faculty");
        if (s.length === 0) status.push("Missing Subject");
        if (c.length === 0) status.push("Missing Class");

        if (status.length > 0) {
            console.log(`[ORPHAN] ID: ${assign.id} - ${status.join(", ")}`);
        } else {
            // Valid
            const u = await db.select().from(users).where(eq(users.id, f[0].userId)).execute();
            const facultyName = u.length > 0 ? u[0].name : "Unknown User";
            console.log(`[VALID] Faculty: ${facultyName} (${assign.facultyId}) -> Subject: ${s[0].name} -> Class: ${c[0].name}`);
        }
    }
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

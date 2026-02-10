
import { db } from "../db";
import { subjects, attendance } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    // 1. Find subject "TEC-180" or "TECHNICAL PAPER WRITING & IPR"
    const subject = await db.query.subjects.findFirst({
        where: (subjects, { eq, or }) => or(eq(subjects.code, "TEC-180"), eq(subjects.name, "TECHNICAL PAPER WRITING & IPR"))
    });

    if (!subject) {
        console.log("Subject TEC-180 not found!");
        return;
    }

    console.log(`Found subject: ${subject.name} (${subject.code}) ID: ${subject.id}`);

    // 2. Count attendance
    const attendanceRecords = await db.select().from(attendance).where(eq(attendance.subjectId, subject.id));

    console.log(`Attendance Records Count: ${attendanceRecords.length}`);
    if (attendanceRecords.length > 0) {
        console.log("First 3 records:", attendanceRecords.slice(0, 3));
    }
    process.exit(0);
}

main();


import "dotenv/config";
import { db } from "./index";
import { classes, timetable, facultySubjects, students, attendance, marks } from "./schema";
import { eq } from "drizzle-orm";

async function resetClasses() {
    console.log("Resetting classes table...");
    try {
        // 0. Clear Student data first
        await db.delete(attendance);
        await db.delete(marks);
        console.log("Cleared attendance and marks");

        // 1. Clear Timetable (depends on classes)
        await db.delete(timetable);
        console.log("Cleared timetable");

        // 2. Clear Faculty Subjects (depends on classes)
        await db.delete(facultySubjects);
        console.log("Cleared faculty assignments");

        // 3. Clear Students (depends on classes)
        await db.delete(students);
        console.log("Cleared students");

        // 4. Clear Classes
        await db.delete(classes);
        console.log("Cleared classes table successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to reset classes:", error);
        process.exit(1);
    }
}

resetClasses();

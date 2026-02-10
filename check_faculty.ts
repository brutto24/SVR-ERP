
import { db } from "./src/db";
import { facultySubjects, faculty, subjects, classes, users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking faculty assignments...");

    const assignments = await db.select({
        facultyId: facultySubjects.facultyId,
        facultyName: users.name,
        subjectId: facultySubjects.subjectId,
        subjectName: subjects.name,
        className: classes.name
    })
        .from(facultySubjects)
        .leftJoin(faculty, eq(facultySubjects.facultyId, faculty.id))
        .leftJoin(users, eq(faculty.userId, users.id))
        .leftJoin(subjects, eq(facultySubjects.subjectId, subjects.id))
        .leftJoin(classes, eq(facultySubjects.classId, classes.id))
        .execute();

    console.log(`Total Assignments found: ${assignments.length}`);
    console.log(JSON.stringify(assignments, null, 2));

    // Also check faculty details explicitly
    const facs = await db.select({
        id: faculty.id,
        name: users.name
    }).from(faculty)
        .leftJoin(users, eq(faculty.userId, users.id))
        .execute();

    console.log("\nFaculty List:");
    console.log(JSON.stringify(facs, null, 2));
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

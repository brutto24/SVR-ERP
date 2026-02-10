
import { db } from "./src/db";
import { timetable, subjects, classes } from "./src/db/schema";
import { eq, desc } from "drizzle-orm";

async function main() {
    console.log("Checking timetable records...");

    const records = await db.select({
        id: timetable.id,
        day: timetable.dayOfWeek,
        period: timetable.period,
        subject: subjects.name,
        class: classes.name,
        subjectId: timetable.subjectId,
        classId: timetable.classId
    })
        .from(timetable)
        .leftJoin(subjects, eq(timetable.subjectId, subjects.id))
        .leftJoin(classes, eq(timetable.classId, classes.id))
        .orderBy(desc(timetable.dayOfWeek)) // rough sort
        .execute();

    console.log(`Total Timetable Entries: ${records.length}`);
    console.log(JSON.stringify(records, null, 2));
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

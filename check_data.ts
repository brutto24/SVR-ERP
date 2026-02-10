
import { db } from "./src/db";
import { academicBatches, classes, students, classTeachers, users } from "./src/db/schema";

async function main() {
    try {
        const ct = await db.select().from(classTeachers).limit(1);
        const usr = await db.select().from(users).limit(1);
        const stud = await db.select().from(students).limit(1);

        console.log("Class Teachers:", ct);
        console.log("Users:", usr);
        console.log("Students:", stud);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

main();

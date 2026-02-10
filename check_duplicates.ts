
import { db } from "./src/db";
import { subjects, facultySubjects } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const allSubjects = await db.select().from(subjects).where(eq(subjects.name, "Cloud Computing for AI"));
    console.log("All subjects with name 'Cloud Computing for AI':", allSubjects);

    const facultySubs = await db.select().from(facultySubjects);
    console.log("All faculty assignments:", facultySubs);
}

main().catch(console.error);

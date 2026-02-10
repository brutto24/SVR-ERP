
import { db } from "../db";
import { subjects } from "../db/schema";
import { eq, or } from "drizzle-orm";

async function main() {
    console.log("Searching for 'adfafawg'...");

    const subject = await db.query.subjects.findFirst({
        where: (subjects, { eq, or }) => or(
            eq(subjects.code, "adfafawg"),
            eq(subjects.name, "adfafawg")
        )
    });

    if (subject) {
        console.log("Found subject:", subject);
    } else {
        console.log("Subject 'adfafawg' not found.");
    }

    // Also check all subjects to see if it's mixed case or partial match
    const allSubjects = await db.select().from(subjects);
    const match = allSubjects.find(s => s.code.toLowerCase().includes("adfafawg") || s.name.toLowerCase().includes("adfafawg"));
    if (match && !subject) {
        console.log("Found match via list scan:", match);
    }

    process.exit(0);
}

main();

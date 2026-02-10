
import { db } from "./src/db";
import { facultySubjects } from "./src/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
    const wrongSubjectId = "sub-cloud-computing-for-ai";
    const correctSubjectId = "sub-23a30604b";

    // Update assignment
    const result = await db.update(facultySubjects)
        .set({ subjectId: correctSubjectId })
        .where(eq(facultySubjects.subjectId, wrongSubjectId))
        .returning();

    console.log("Updated assignments:", result);
}

main().catch(console.error);

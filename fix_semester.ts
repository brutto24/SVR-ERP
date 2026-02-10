
import { db } from "./src/db";
import { subjects, students } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function fixData() {
    console.log("Checking subject mapping...");
    const sub = await db.select().from(subjects).where(eq(subjects.name, "Cloud Computing for AI")).limit(1);

    if (sub.length > 0) {
        console.log("Current Subject:", sub[0]);
        if (sub[0].semester !== "3-2") {
            console.log("Updating to 3-2...");
            await db.update(subjects).set({ semester: "3-2" }).where(eq(subjects.id, sub[0].id));
            console.log("Updated.");
        } else {
            console.log("Subject is already 3-2.");
        }
    } else {
        console.log("Subject not found.");
    }
}

fixData().catch(console.error).then(() => process.exit(0));


import "dotenv/config";
import { db } from "../db";
import { users, students } from "../db/schema";
import { eq } from "drizzle-orm";
import { encryptPassword } from "../lib/auth";

async function main() {
    console.log("Starting password migration...");

    // Fetch all students
    const allStudents = await db.select().from(students);
    console.log(`Found ${allStudents.length} students to update.`);

    for (const stu of allStudents) {
        if (!stu.registerNumber) continue;

        console.log(`Updating password for ${stu.registerNumber}...`);
        const hashedPassword = await encryptPassword(stu.registerNumber);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, stu.userId));
    }

    console.log("Migration complete!");
    process.exit(0);
}

main();

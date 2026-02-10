
import "dotenv/config";
import { db } from "../db";
import { users, students } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking students...");
    const allStudents = await db.select().from(students);

    for (const s of allStudents) {
        console.log(`Student: ${s.registerNumber} (User ID: ${s.userId})`);
        const user = await db.query.users.findFirst({
            where: eq(users.id, s.userId)
        });

        if (user) {
            console.log(`  - Linked User: ${user.name} (${user.email})`);
            console.log(`  - Role: ${user.role}`);
            console.log(`  - Password Hash: ${user.password.substring(0, 10)}...`);
            console.log(`  - Must Change Pass: ${user.mustChangePassword}`);
        } else {
            console.log("  - NO LINKED USER FOUND");
        }
    }
    process.exit(0);
}

main();

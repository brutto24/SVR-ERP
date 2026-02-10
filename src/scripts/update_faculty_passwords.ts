
import "dotenv/config";
import { db } from "../db";
import { users, faculty } from "../db/schema";
import { eq } from "drizzle-orm";
import { encryptPassword } from "../lib/auth";

async function main() {
    console.log("Starting faculty password update...");

    // Fetch all faculty with their user accounts
    const allFaculty = await db.select({
        facultyId: faculty.id,
        employeeId: faculty.employeeId,
        userId: faculty.userId,
    }).from(faculty);

    console.log(`Found ${allFaculty.length} faculty members.`);

    for (const f of allFaculty) {
        if (!f.userId) continue;

        console.log(`Updating password for ${f.employeeId}...`);

        // Encrypt the Employee ID as the new password
        const newPasswordHash = await encryptPassword(f.employeeId);

        // Update the user record
        await db.update(users)
            .set({
                password: newPasswordHash,
                mustChangePassword: true // Force them to change it
            })
            .where(eq(users.id, f.userId));

        console.log(`  > Done.`);
    }

    console.log("All faculty passwords updated successfully.");
    process.exit(0);
}

main();

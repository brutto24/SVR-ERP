
import "dotenv/config";
import { db } from "../db";
import { users, faculty } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking Faculty...");
    const allFaculty = await db.select().from(faculty);

    for (const f of allFaculty) {
        console.log(`Faculty ID Part: ${f.employeeId}`);
        const user = await db.query.users.findFirst({
            where: eq(users.id, f.userId)
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

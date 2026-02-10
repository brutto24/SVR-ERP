import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { encryptPassword } from "../lib/auth";

async function main() {
    console.log("Seeding database...");

    try {
        const hashedPassword = await encryptPassword("admin123");

        await db.insert(users).values({
            id: crypto.randomUUID(),
            email: "admin@svr.edu",
            password: hashedPassword,
            name: "System Admin",
            role: "admin",
            isActive: true,
        }).onConflictDoNothing();

        console.log("Seeding complete! Admin user created.");
        console.log("Email: admin@svr.edu");
        console.log("Password: admin123");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed!", err);
        process.exit(1);
    }
}

main();

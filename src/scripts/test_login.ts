
import "dotenv/config";
import { db } from "../db";
import { users, students } from "../db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "../lib/auth";

async function main() {
    const registerNumber = "23AM1AA31F1"; // The problem ID
    const passwordAttempt = "23AM1AA31F1";

    console.log(`Checking login for ${registerNumber}...`);

    const student = await db.query.students.findFirst({
        where: eq(students.registerNumber, registerNumber)
    });

    if (!student) {
        console.error("❌ Student record NOT found.");
        process.exit(1);
    }
    console.log("✅ Student record found.");

    const user = await db.query.users.findFirst({
        where: eq(users.id, student.userId)
    });

    if (!user) {
        console.error("❌ Linked user NOT found.");
        process.exit(1);
    }
    console.log("✅ Linked user found.");

    const isValid = await verifyPassword(passwordAttempt, user.password);

    if (isValid) {
        console.log("✅ Password match SUCCESS. Login should work.");
    } else {
        console.error("❌ Password match FAILED.");
        console.log(`Stored Hash: ${user.password}`);
        console.log(`Attempted Plaintext: ${passwordAttempt}`);
    }

    process.exit(0);
}

main();

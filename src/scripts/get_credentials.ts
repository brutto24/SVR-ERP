
import "dotenv/config";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const students = await db.select().from(users).where(eq(users.role, "student")).limit(5);
    console.log("Student Credentials:");
    students.forEach(u => {
        console.log(`Name: ${u.name}, Email: ${u.email}, Password (Hash): ${u.password.substring(0, 10)}...`);
    });
    process.exit(0);
}
main();

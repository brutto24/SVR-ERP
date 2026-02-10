
import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Adding profile_picture column...");
    try {
        await db.execute(sql`ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "profile_picture" text`);
        console.log("Column added successfully.");
    } catch (error) {
        console.error("Error adding column:", error);
    }
    process.exit(0);
}

main();

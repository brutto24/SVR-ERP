import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Creating class_teachers table...");
    try {
        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS "class_teachers" (
                "id" text PRIMARY KEY NOT NULL,
                "faculty_id" text NOT NULL,
                "batch_id" text NOT NULL,
                "class_id" text NOT NULL,
                CONSTRAINT "class_teachers_unique" UNIQUE("batch_id","class_id"),
                FOREIGN KEY ("faculty_id") REFERENCES "faculty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                FOREIGN KEY ("batch_id") REFERENCES "academic_batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
                FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
            );
        `);
        console.log("Table created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to create table:", err);
        process.exit(1);
    }
}

main();


import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Applying manual migration...");

        await db.execute(sql`ALTER TABLE "class_teachers" ADD COLUMN "can_edit_student_data" boolean DEFAULT false NOT NULL;`);
        console.log("Added can_edit_student_data to class_teachers");

        await db.execute(sql`ALTER TABLE "students" ADD COLUMN "mobile_number" text;`);
        await db.execute(sql`ALTER TABLE "students" ADD COLUMN "parent_name" text;`);
        await db.execute(sql`ALTER TABLE "students" ADD COLUMN "parent_mobile" text;`);
        await db.execute(sql`ALTER TABLE "students" ADD COLUMN "address" text;`);
        await db.execute(sql`ALTER TABLE "students" ADD COLUMN "aadhar_number" text;`);
        await db.execute(sql`ALTER TABLE "students" ADD COLUMN "apaar_id" text;`);
        console.log("Added columns to students");

        await db.execute(sql`ALTER TABLE "users" ADD COLUMN "token_version" integer DEFAULT 0 NOT NULL;`);
        await db.execute(sql`ALTER TABLE "users" ADD COLUMN "is_first_login" boolean DEFAULT true NOT NULL;`);
        console.log("Added columns to users");

        console.log("Migration applied successfully!");
    } catch (e: any) {
        console.error("Manual migration failed!");
        console.error(e.message);
        console.error(e.code);
        if (e.code === '42701') {
            console.log("Column already exists? Continuing...");
        }
    }
    process.exit(0);
}

main();

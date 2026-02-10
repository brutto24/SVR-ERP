import "dotenv/config";
import { db } from "./index";
import { academicBatches, classes, subjects } from "./schema";
import { eq } from "drizzle-orm"; // Import eq here

async function main() {
    console.log("🌱 Seeding 2023-2027 Batch Data...");

    try {
        // 1. Ensure Batch Exists
        const batchId = "batch-2023-2027";
        console.log(`Checking Batch: ${batchId}...`);

        await db.insert(academicBatches).values({
            id: batchId,
            name: "2023 - 2027",
            startDate: new Date("2023-01-01"),
            endDate: new Date("2027-12-31"),
            isActive: true,
        }).onConflictDoNothing();

        // 2. Ensure Classes Exist (CLASS A, CLASS B, CLASS C)
        console.log("Upserting Classes...");
        const classNames = ["CLASS A", "CLASS B", "CLASS C"];
        const classIds: Record<string, string> = {};

        for (const name of classNames) {
            const id = `class-${name.toLowerCase().replace(" ", "-")}`; // class-class-a
            classIds[name] = id;

            // Try to find if it exists to update name, or insert
            // Since onConflictDoNothing ignores updates, we'll checking first or use upset if supported (postgres)
            // For simplicity in this stack, strict insert on conflict ignore is fine, but user asked for specific names.
            // Let's force update the name if it exists or insert.

            // Check existence
            const existing = await db.query.classes.findFirst({
                where: (classes, { eq }) => eq(classes.id, id)
            });

            if (existing) {
                await db.update(classes).set({ name }).where(eq(classes.id, id));
            } else {
                await db.insert(classes).values({ id, name });
            }
        }

        // 3. Subjects List
        const subjectsList = [
            "CLOUD COMPUTING FOR AI",
            "BIG DATA ANALYTICS & AI APPLICATIONS",
            "FULL STACK AI DEVELOPMENT",
            "BLOCKCHAIN FOR AI",
            "AI FOR FINANCE",
            "DISASTER MANAGEMENT",
            "BIG DATA & CLOUD COMPUTING LAB",
            "FULL STACK AI LAB",
            "SOFT SKILLS",
            "TECHNICAL PAPER WRITING & IPR",
            "CAMPUS RECRUITMENT TRAINING",
            "MENTORING"
        ];

        console.log("Seeding Subjects...");

        for (const subjectName of subjectsList) {
            const code = subjectName.substring(0, 3).toUpperCase() + "-" + Math.floor(Math.random() * 1000); // Mock code
            const type = subjectName.includes("LAB") ? "lab" : "theory";
            const id = `sub-${subjectName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

            await db.insert(subjects).values({
                id: id,
                name: subjectName,
                code: code,
                type: type,
                credits: type === 'lab' ? 2 : 3, // Assumption
                batchId: batchId,
                semester: "1-1", // Defaulting to 1-1 as not specified, can be edited later
            }).onConflictDoNothing();
        }

        console.log("✅ Seeding Subjects & Classes Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

main();

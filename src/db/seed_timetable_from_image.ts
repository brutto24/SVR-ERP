
import "dotenv/config";
import { db } from "./index";
import { users, faculty, subjects, classes, academicBatches, facultySubjects, timetable } from "./schema";
import { encryptPassword } from "../lib/auth";
import { eq, and } from "drizzle-orm";

async function main() {
    console.log("🌱 Seeding Timetable Data from Image (Debug Shared DB)...");

    try {
        const defaultPassword = await encryptPassword("faculty123");

        console.log("1. Batch...");
        const batchId = "batch-2025-2026";
        await db.insert(academicBatches).values({
            id: batchId,
            name: "2025 - 2026",
            startDate: new Date("2025-01-01"),
            endDate: new Date("2026-12-31"),
            isActive: true,
        }).onConflictDoNothing();

        const classId = "class-iii-b-tech-ai";
        const className = "III-B. Tech - AI";

        // Upsert Class
        const existingClass = await db.query.classes.findFirst({ where: eq(classes.id, classId) });
        if (!existingClass) {
            await db.insert(classes).values({ id: classId, name: className });
        }

        console.log("2. Faculty...");
        const facultyList = [
            { code: "BKB", name: "Mr. B. Kiran Babu", email: "b.kiran@svr.edu", dept: "AI" },
            { code: "BRKR", name: "Mr. B. Rama Krishna Reddy", email: "b.ramakrishna@svr.edu", dept: "AI" },
            { code: "AHPR", name: "Mr. A. Hari Prasad Reddy", email: "a.hariprasad@svr.edu", dept: "AI" },
            { code: "MSR", name: "Dr. M. Subba Reddy", email: "m.subbareddy@svr.edu", dept: "AI" },
            { code: "KAL", name: "Mr. K. Alluraiah", email: "k.alluraiah@svr.edu", dept: "AI" },
            { code: "PMJ", name: "Mrs. P. Manjusha", email: "p.manjusha@svr.edu", dept: "AI" },
            { code: "VK", name: "Mrs. V. Karuna", email: "v.karuna@svr.edu", dept: "HUM" },
            { code: "BT", name: "Mr. Binoy Thomos", email: "binoy.thomos@svr.edu", dept: "HUM" },
            { code: "YOG", name: "Mr. Yogesh", email: "yogesh@svr.edu", dept: "AI" },
            { code: "YAR", name: "Mrs. Y. Anitha Reddy", email: "y.anitha@svr.edu", dept: "AI" },
        ];

        const facultyMap: Record<string, string> = {};

        for (const f of facultyList) {
            const userId = `user-${f.code.toLowerCase()}`;
            const facultyId = `fac-${f.code.toLowerCase()}`;

            await db.insert(users).values({
                id: userId,
                email: f.email,
                password: defaultPassword,
                name: f.name,
                role: "faculty",
                isActive: true,
            }).onConflictDoNothing();

            await db.insert(faculty).values({
                id: facultyId,
                userId: userId,
                employeeId: `EMP-${f.code}`,
                designation: f.name.startsWith("Dr.") ? "Professor" : "Assistant Professor",
                department: f.dept,
            }).onConflictDoNothing();

            facultyMap[f.code] = facultyId;
        }

        console.log("3. Subjects...");
        const subjectList = [
            { code: "23A30604b", short: "CCAI", name: "CLOUD COMPUTING FOR AI", credits: 3, type: "theory" },
            { code: "23A31601", short: "BDAAA", name: "BIG DATA ANALYTICS & AI APPLICATIONS", credits: 3, type: "theory" },
            { code: "23A31602T", short: "FSAID", name: "FULL STACK AI DEVELOPMENT", credits: 3, type: "theory" },
            { code: "23A31603b", short: "BCAI", name: "BLOCKCHAIN FOR AI", credits: 3, type: "theory" },
            { code: "23A30603c", short: "AIF", name: "AI FOR FINANCE", credits: 3, type: "theory" },
            { code: "23A01606a", short: "DM", name: "DISASTER MANAGEMENT", credits: 3, type: "theory" },
            { code: "23A31605", short: "BDCC LAB", name: "BIG DATA & CLOUD COMPUTING LAB", credits: 1.5, type: "lab" },
            { code: "23A31602P", short: "FSAI LAB", name: "FULL STACK AI LAB", credits: 1.5, type: "lab" },
            { code: "23A52501", short: "SS LAB", name: "SOFT SKILLS", credits: 2, type: "lab" },
            { code: "23A52601", short: "TPW&IPR", name: "TECHNICAL PAPER WRITING & IPR", credits: 0, type: "theory" },
            { code: "CRT", short: "CRT", name: "CAMPUS RECRUITMENT TRAINING", credits: 0, type: "theory" },
            { code: "MNTG", short: "MENTORING", name: "MENTORING", credits: 0, type: "theory" },
        ];

        const subjectMap: Record<string, string> = {};

        for (const s of subjectList) {
            const id = `sub-${s.code.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
            await db.insert(subjects).values({
                id: id,
                name: s.name,
                code: s.code,
                type: s.type as "theory" | "lab",
                credits: s.credits,
                batchId: batchId,
                semester: "3-2",
            }).onConflictDoNothing();
            subjectMap[s.short] = id;
        }

        console.log("4. Assignments...");
        const assignments = [
            { short: "CCAI", faculty: ["BKB"] },
            { short: "BDAAA", faculty: ["BRKR"] },
            { short: "FSAID", faculty: ["AHPR"] },
            { short: "BCAI", faculty: ["MSR"] },
            { short: "AIF", faculty: ["KAL"] },
            { short: "DM", faculty: ["PMJ"] },
            { short: "BDCC LAB", faculty: ["BKB", "BRKR"] },
            { short: "FSAI LAB", faculty: ["AHPR"] },
            { short: "SS LAB", faculty: ["BT"] },
            { short: "TPW&IPR", faculty: ["VK"] },
            { short: "CRT", faculty: ["YOG"] },
            { short: "MENTORING", faculty: ["YAR"] },
        ];

        for (const assign of assignments) {
            const subId = subjectMap[assign.short];
            for (const facCode of assign.faculty) {
                const facId = facultyMap[facCode];
                if (subId && facId) {
                    await db.insert(facultySubjects).values({
                        id: `assign-${subId}-${facId}-${classId}`,
                        facultyId: facId,
                        subjectId: subId,
                        classId: classId,
                    }).onConflictDoNothing();
                }
            }
        }

        console.log("5. Timetable...");
        const semester = "3-2";
        const entries: any[] = [];
        const add = (day: string, period: number, shortCode: string) => {
            if (subjectMap[shortCode]) {
                entries.push({
                    id: `tt-${day}-${period}-${classId}`,
                    batchId: batchId,
                    classId: classId,
                    semester: semester,
                    dayOfWeek: day,
                    period: period,
                    subjectId: subjectMap[shortCode]
                });
            } else {
                console.warn(`WARNING: Missing subject map for ${shortCode}`);
            }
        };

        // MON
        add("Monday", 1, "FSAID");
        add("Monday", 2, "BCAI");
        add("Monday", 3, "CCAI");
        add("Monday", 4, "AIF");
        add("Monday", 5, "MENTORING");
        add("Monday", 6, "TPW&IPR");
        add("Monday", 7, "FSAID");

        // TUE
        add("Tuesday", 1, "CCAI");
        add("Tuesday", 2, "BDAAA");
        add("Tuesday", 3, "AIF");
        add("Tuesday", 4, "BCAI");
        add("Tuesday", 5, "DM");
        add("Tuesday", 6, "BDAAA");
        add("Tuesday", 7, "AIF");

        // WED
        add("Wednesday", 1, "FSAID");
        add("Wednesday", 2, "BDAAA");
        add("Wednesday", 3, "CCAI");
        add("Wednesday", 4, "BCAI");
        add("Wednesday", 5, "BDCC LAB");
        add("Wednesday", 6, "BDCC LAB");
        add("Wednesday", 7, "BDCC LAB");

        // THU
        add("Thursday", 1, "AIF");
        add("Thursday", 2, "TPW&IPR");
        add("Thursday", 3, "BCAI");
        add("Thursday", 4, "BDAAA");
        add("Thursday", 5, "FSAI LAB");
        add("Thursday", 6, "FSAI LAB");
        add("Thursday", 7, "FSAI LAB");

        // FRI
        add("Friday", 1, "SS LAB");
        add("Friday", 2, "SS LAB");
        add("Friday", 3, "SS LAB");
        add("Friday", 4, "CCAI");
        add("Friday", 5, "DM");
        add("Friday", 6, "BDAAA");
        add("Friday", 7, "CCAI");

        // SAT
        add("Saturday", 1, "FSAID");
        add("Saturday", 2, "AIF");
        add("Saturday", 3, "CRT");
        add("Saturday", 4, "CRT");
        add("Saturday", 5, "BCAI");
        add("Saturday", 6, "DM");
        add("Saturday", 7, "FSAID");

        console.log(`Inserting ${entries.length} timetable entries...`);
        let idx = 0;
        for (const entry of entries) {
            idx++;
            try {
                // Log failing entry attempt
                if (idx % 10 === 0) console.log(`Processing ${idx}...`);
                await db.insert(timetable).values(entry).onConflictDoNothing();
            } catch (e) {
                console.error(`Failed to insert entry #${idx}:`, JSON.stringify(entry));
                throw e;
            }
        }

        console.log("✅ Timetable Digitization Complete!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
}

main();

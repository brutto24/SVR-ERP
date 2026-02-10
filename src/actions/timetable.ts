"use server";

import { db } from "@/db";
import { timetable, subjects, classes, facultySubjects, academicBatches } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type TimetableEntry = {
    id: string; // timetable id
    dayOfWeek: string;
    period: number;
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    batchId: string;
    semester: string;
};

// Fetch timetable for a specific faculty member (based on assignments)
// Note: This logic assumes if a class has a subject scheduled, and that subject is assigned to this faculty, it's their class.
export async function getFacultyTimetable(facultyId: string) {
    // 1. Get assignments for this faculty
    const assignments = await db.select({
        subjectId: facultySubjects.subjectId,
        classId: facultySubjects.classId
    })
        .from(facultySubjects)
        .where(eq(facultySubjects.facultyId, facultyId))
        .execute();

    if (assignments.length === 0) return [];

    // 2. Fetch timetable entries for these subject+class combinations
    // We can't easy doing "IN" with tuples in some ORMs, so let's fetch matching entries
    // Or simpler: Fetch ALL timetable entries for these classes, then filter by Subject match
    // Actually, simpler: fetch timetable where subjectId is in values.

    // Let's filter by subjectId because a faculty might teach Subject A to Class B.
    // The timetable entry says "Class B has Subject A at Monday Period 1".
    // So if we fetch all timetable entries where subjectId matches one of the faculty's assigned subjects...
    // AND the classId matches (to ensure we don't pick up another faculty teaching same subject to diff class if that assignment rule exists).

    // However, `facultySubjects` is unique on subject+class.
    // So looking for timetable entries with matching subjectId AND classId is correct.

    // Let's construct a list of conditions or just fetch all for relevant classes and filter in JS for simplicity/speed if data is small.
    // Optimized:
    const assignedSubjectIds = assignments.map(a => a.subjectId);
    if (assignedSubjectIds.length === 0) return [];

    const entries = await db.select({
        id: timetable.id,
        dayOfWeek: timetable.dayOfWeek,
        period: timetable.period,
        subjectId: timetable.subjectId,
        subjectName: subjects.name,
        classId: timetable.classId,
        className: classes.name,
        batchId: timetable.batchId,
        semester: timetable.semester,
    })
        .from(timetable)
        .innerJoin(subjects, eq(timetable.subjectId, subjects.id))
        .innerJoin(classes, eq(timetable.classId, classes.id))
        .where(sql`${timetable.subjectId} IN ${assignedSubjectIds}`) // Pseudo-query, Drizzle needs `inArray`
        .execute();

    const validEntries = entries.filter(e => {
        const match = assignments.some(a => a.subjectId === e.subjectId && a.classId === e.classId);
        return match;
    });

    return validEntries as TimetableEntry[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
type DayOfWeek = typeof DAYS[number];

export async function updateTimetableSlot(
    facultyId: string, // For revalidation/check
    data: {
        dayOfWeek: string;
        period: number;
        classId: string;
        subjectId: string;
        semester: string; // Needed for schema
        batchId: string;  // Needed for schema
    }
) {
    try {
        // Validation & Type Casting
        if (!DAYS.includes(data.dayOfWeek as DayOfWeek)) {
            return { success: false, error: "Invalid day" };
        }
        const day = data.dayOfWeek as DayOfWeek;

        // Upsert logic:
        // Check manually for existing slot
        const existing = await db.select().from(timetable).where(and(
            eq(timetable.classId, data.classId),
            eq(timetable.dayOfWeek, day), // Use typed variable
            eq(timetable.period, data.period)
        )).execute();

        if (existing.length > 0) {
            // Update
            await db.update(timetable)
                .set({
                    subjectId: data.subjectId,
                    batchId: data.batchId,
                    semester: data.semester
                })
                .where(eq(timetable.id, existing[0].id));
        } else {
            // Insert
            await db.insert(timetable).values({
                id: crypto.randomUUID(),
                dayOfWeek: day, // Use typed variable
                period: data.period,
                classId: data.classId,
                subjectId: data.subjectId,
                batchId: data.batchId,
                semester: data.semester,
            });
        }

        revalidatePath("/admin/faculty");
        revalidatePath(`/admin/faculty/${facultyId}`);
        revalidatePath("/faculty/timetable");
        revalidatePath("/student/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to update timetable:", error);
        return { success: false, error: "Failed to update timetable" };
    }
}

export async function getClassTimetable(classId: string, semester: string) {
    const entries = await db.select({
        id: timetable.id,
        dayOfWeek: timetable.dayOfWeek,
        period: timetable.period,
        subjectId: timetable.subjectId,
        subjectName: subjects.name,
    })
        .from(timetable)
        .leftJoin(subjects, eq(timetable.subjectId, subjects.id))
        .where(and(
            eq(timetable.classId, classId),
            eq(timetable.semester, semester)
        ))
        .execute();

    return entries;
}

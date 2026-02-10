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
        classId?: string;
        subjectId?: string;
        semester?: string; // Needed for schema
        batchId?: string;  // Needed for schema
    }
) {
    try {
        // Validation & Type Casting
        const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
        type DayOfWeek = typeof DAYS[number];

        if (!DAYS.includes(data.dayOfWeek as DayOfWeek)) {
            return { success: false, error: "Invalid day" };
        }
        const day = data.dayOfWeek as DayOfWeek;

        await db.transaction(async (tx) => {
            // 1. Get faculty assignments to identify which slots belong to them
            const assignments = await tx.select({
                subjectId: facultySubjects.subjectId,
                classId: facultySubjects.classId
            })
                .from(facultySubjects)
                .where(eq(facultySubjects.facultyId, facultyId));

            // 2. Find and delete existing entry for THIS faculty at THIS day/period
            if (assignments.length > 0) {
                const existingEntries = await tx.select({
                    id: timetable.id,
                    subjectId: timetable.subjectId,
                    classId: timetable.classId
                })
                    .from(timetable)
                    .where(and(
                        eq(timetable.dayOfWeek, day),
                        eq(timetable.period, data.period)
                    ));

                // Filter to find entry belonging to this faculty
                const entryToDelete = existingEntries.find(e =>
                    assignments.some(a => a.subjectId === e.subjectId && a.classId === e.classId)
                );

                if (entryToDelete) {
                    await tx.delete(timetable).where(eq(timetable.id, entryToDelete.id));
                }
            }

            // 3. Insert new entry if valid data provided (not clearing to Free)
            if (data.classId && data.subjectId && data.batchId && data.semester) {
                await tx.insert(timetable).values({
                    id: crypto.randomUUID(),
                    batchId: data.batchId,
                    classId: data.classId,
                    semester: data.semester,
                    dayOfWeek: day,
                    period: data.period,
                    subjectId: data.subjectId,
                });
            }
        });


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

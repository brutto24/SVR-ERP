"use server";

import { db } from "@/db";
import { attendance, marks, students, subjects, facultySubjects, academicBatches, classes, faculty, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- ATTENDANCE ---
export async function markAttendance(
    facultyId: string, // User ID of faculty
    data: {
        studentId: string;
        subjectId: string;
        date: Date;
        period: number;
        isPresent: boolean;
    }[]
) {
    try {
        // 1. Validate if already locked?
        // Doing it per record or batch? Prompt says "Faculty can submit data only ONCE".
        // We check if ANY record exists for this context (Class/Date/Period) that is locked.
        // For simplicity, we check the first student's record potential collision.
        // Better: Check if any attendance exists for this Subject/Date/Period/Class combo that is locked.

        // Assuming UI passes a list of students for a specific class/subject/period
        if (data.length === 0) return { success: false, error: "No data provided" };

        const sample = data[0];
        const existing = await db.query.attendance.findFirst({
            where: and(
                eq(attendance.studentId, sample.studentId), // This might be too specific
                eq(attendance.subjectId, sample.subjectId),
                eq(attendance.date, sample.date),
                eq(attendance.period, sample.period)
            )
        });

        if (existing?.isLocked) {
            return { success: false, error: "Attendance already submitted and locked for this period." };
        }

        // 2. Insert/Update
        await db.transaction(async (tx) => {
            const studentIdsToUpdate = new Set<string>();

            for (const record of data) {
                await tx.insert(attendance).values({
                    id: crypto.randomUUID(),
                    studentId: record.studentId,
                    subjectId: record.subjectId,
                    date: record.date,
                    period: record.period,
                    isPresent: record.isPresent,
                    isLocked: true,
                    markedBy: facultyId
                }).onConflictDoNothing();

                studentIdsToUpdate.add(record.studentId);
            }

            // Recalculate Percentage for affected students
            for (const studentId of studentIdsToUpdate) {
                // Get counts
                const totalClasses = await tx.select({ count: sql<number>`count(*)` })
                    .from(attendance)
                    .where(eq(attendance.studentId, studentId))
                    .then(res => Number(res[0].count));

                const attendedClasses = await tx.select({ count: sql<number>`count(*)` })
                    .from(attendance)
                    .where(and(
                        eq(attendance.studentId, studentId),
                        eq(attendance.isPresent, true)
                    ))
                    .then(res => Number(res[0].count));

                const percentage = totalClasses > 0
                    ? Math.round((attendedClasses / totalClasses) * 100)
                    : 0;

                // Update Student Record
                await tx.update(students)
                    .set({ attendancePercentage: percentage })
                    .where(eq(students.id, studentId));
            }
        });

        revalidatePath("/faculty/attendance");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to mark attendance" };
    }
}

// --- MARKS ---
export async function enterMarks(
    facultyId: string,
    data: {
        studentId: string;
        subjectId: string;
        type: "mid1" | "mid2" | "semester" | "lab_internal" | "lab_external";
        objective?: number;
        theory?: number;
        assignment?: number;
        total: number;
    }[]
) {
    console.log("=== ENTER MARKS START ===");
    console.log("Faculty ID:", facultyId);
    console.log("Data count:", data.length);

    try {
        if (data.length === 0) {
            console.log("ERROR: No data to save");
            return { success: false, error: "No data to save" };
        }

        const sample = data[0];
        console.log("Sample record:", sample);

        // Check lock status
        console.log("Checking lock status...");
        const existing = await db.query.marks.findFirst({
            where: and(
                eq(marks.studentId, sample.studentId),
                eq(marks.subjectId, sample.subjectId),
                eq(marks.type, sample.type)
            )
        });

        console.log("Existing marks:", existing);

        if (existing?.isLocked) {
            console.log("ERROR: Marks already locked");
            return { success: false, error: "Marks already locked for this subject and exam type." };
        }

        console.log("Starting transaction...");
        await db.transaction(async (tx) => {
            for (const record of data) {
                console.log("Inserting/updating marks for student:", record.studentId);
                await tx.insert(marks).values({
                    id: crypto.randomUUID(),
                    studentId: record.studentId,
                    subjectId: record.subjectId,
                    type: record.type,
                    objective: record.objective || 0,
                    theory: record.theory || 0,
                    assignment: record.assignment || 0,
                    total: record.total,
                    isLocked: true, // Immediate lock
                    enteredBy: facultyId
                }).onConflictDoUpdate({
                    target: [marks.studentId, marks.subjectId, marks.type],
                    set: {
                        objective: record.objective || 0,
                        theory: record.theory || 0,
                        assignment: record.assignment || 0,
                        total: record.total,
                        isLocked: true,
                        enteredBy: facultyId
                    }
                });
            }
        });

        console.log("Transaction completed successfully");
        revalidatePath("/faculty/marks");
        console.log("=== ENTER MARKS SUCCESS ===");
        return { success: true };

    } catch (error) {
        console.error("=== ENTER MARKS ERROR ===");
        console.error("Error details:", error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        return { success: false, error: error instanceof Error ? error.message : "Failed to submit marks" };
    }
}

// --- DATA FETCHING FOR FORMS ---
export async function getFacultyClasses(facultyUserId: string) {
    // Join faculty -> faculty_subjects -> classes
    // This requires complex join query or Drizzle query builder
    const facultyRecord = await db.query.faculty.findFirst({
        where: eq(faculty.userId, facultyUserId),
        with: {
            assignments: {
                with: {
                    subject: true,
                    class: true
                }
            }
        }
    });

    if (!facultyRecord) return [];

    // Transform to unique Subject-Class pairs
    return facultyRecord.assignments.map(a => ({
        classId: a.classId,
        className: (a as any).class.name, // Typing issue helper
        subjectId: a.subjectId,
        subjectName: (a as any).subject.name,
        semester: (a as any).subject.semester
    }));
}

export async function getStudentsForClass(classId: string) {
    return await db.select({
        id: students.id,
        name: users.name,
        registerNumber: students.registerNumber,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(eq(students.classId, classId))
        .orderBy(students.registerNumber);
}

export async function getExistingMarks(classId: string, subjectId: string, type: string) {
    console.log(`[getExistingMarks] Fetching for Class: ${classId}, Subject: ${subjectId}, Type: ${type}`);

    // Check if any marks exist for this criteria to debug
    const check = await db.select({ count: sql<number>`count(*)` })
        .from(marks)
        .where(and(
            eq(marks.subjectId, subjectId),
            eq(marks.type, type as any)
        ));
    console.log(`[getExistingMarks] Total marks found in DB for subject/type:`, check[0]);

    const results = await db.select({
        studentId: marks.studentId,
        objective: marks.objective,
        theory: marks.theory,
        assignment: marks.assignment,
        total: marks.total,
        isLocked: marks.isLocked
    })
        .from(marks)
        .innerJoin(students, eq(marks.studentId, students.id))
        .where(and(
            eq(students.classId, classId),
            eq(marks.subjectId, subjectId),
            eq(marks.type, type as any)
        ));

    console.log(`[getExistingMarks] Returning ${results.length} records`);
    return results;
}


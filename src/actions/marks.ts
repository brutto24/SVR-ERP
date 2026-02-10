"use server";

import { db } from "@/db";
import { marks, students, subjects, users, academicBatches, classes } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSubjectsForClass(classId: string, semester?: string) {
    try {
        const conditions = [eq(subjects.batchId, (await db.query.classes.findFirst({ where: eq(classes.id, classId), with: { batch: true } }))?.batchId || "")];

        // If semester is provided, filter by it. If not, maybe return all?
        // UI uses semester selector.
        if (semester) {
            conditions.push(eq(subjects.semester, semester));
        }

        // We need to match subjects that BELONG to the batch of this class.
        // The query above is a bit convoluted. 
        // Better: Get class -> batchId. Then select subjects where batchId = ... and semester = ...

        const classRecord = await db.query.classes.findFirst({
            where: eq(classes.id, classId),
            columns: { batchId: true }
        });

        if (!classRecord) return [];

        const whereClause = semester
            ? and(eq(subjects.batchId, classRecord.batchId), eq(subjects.semester, semester))
            : eq(subjects.batchId, classRecord.batchId);

        return await db.query.subjects.findMany({
            where: whereClause,
            orderBy: (subjects, { asc }) => [asc(subjects.code)]
        });

    } catch (error) {
        console.error("Failed to fetch subjects:", error);
        return [];
    }
}

export async function getMarks(
    classId: string,
    subjectId: string,
    type: "mid1" | "mid2" | "semester" | "lab_internal" | "lab_external"
) {
    try {
        console.log(`[getMarks] Class: ${classId}, Subject: ${subjectId}, Type: ${type}`);

        const results = await db.select({
            studentId: marks.studentId,
            objective: marks.objective,
            theory: marks.theory,
            assignment: marks.assignment,
            total: marks.total,
            isLocked: marks.isLocked,
            enteredBy: marks.enteredBy
        })
            .from(marks)
            .innerJoin(students, eq(marks.studentId, students.id))
            .where(and(
                eq(students.classId, classId),
                eq(marks.subjectId, subjectId),
                eq(marks.type, type)
            ));

        return results;

    } catch (error) {
        console.error("Failed to fetch marks:", error);
        return [];
    }
}

export async function updateMarks(
    adminUserId: string,
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
    try {
        if (data.length === 0) return { success: false, error: "No data to save" };

        await db.transaction(async (tx) => {
            for (const record of data) {
                // Admin override: Can update even if locked (implied by this being an admin action)
                // But we still mark it as locked after.

                await tx.insert(marks).values({
                    id: crypto.randomUUID(),
                    studentId: record.studentId,
                    subjectId: record.subjectId,
                    type: record.type,
                    objective: record.objective || 0,
                    theory: record.theory || 0,
                    assignment: record.assignment || 0,
                    total: record.total,
                    isLocked: true,
                    enteredBy: adminUserId
                }).onConflictDoUpdate({
                    target: [marks.studentId, marks.subjectId, marks.type],
                    set: {
                        objective: record.objective || 0,
                        theory: record.theory || 0,
                        assignment: record.assignment || 0,
                        total: record.total,
                        isLocked: true,
                        enteredBy: adminUserId
                    }
                });
            }
        });

        revalidatePath("/admin/marks");
        return { success: true };

    } catch (error) {
        console.error("Failed to update marks:", error);
        return { success: false, error: "Failed to update marks" };
    }
}

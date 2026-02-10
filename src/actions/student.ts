"use server";

import { db } from "@/db";
import { attendance, marks, subjects, students } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStudentAttendance(studentUserId: string, semester: string) {
    // 1. Get Student ID from User ID
    const student = await db.query.students.findFirst({
        where: eq(students.userId, studentUserId)
    });

    if (!student) return null;

    // 2. Fetch Attendance
    // We need to filter by subjects that belong to the current semester (or requested semester)
    // This implies joining attendance -> subjects -> filter by semester

    /*
      Optimized: Fetch all attendance for student, group by subject.
      Calculate % per subject.
    */

    const records = await db.select({
        subjectId: attendance.subjectId,
        subjectName: subjects.name,
        status: attendance.isPresent,
        total: sql<number>`count(*)`,
        present: sql<number>`sum(case when ${attendance.isPresent} then 1 else 0 end)`
    })
        .from(attendance)
        .leftJoin(subjects, eq(attendance.subjectId, subjects.id))
        .where(
            and(
                eq(attendance.studentId, student.id),
                eq(subjects.semester, semester)
            )
        )
        .groupBy(attendance.subjectId, subjects.name);

    return records.map(r => ({
        ...r,
        percentage: ((r.present as number) / (r.total as number)) * 100
    }));
}

export async function getStudentMarks(studentUserId: string, semester: string) {
    const student = await db.query.students.findFirst({
        where: eq(students.userId, studentUserId)
    });

    if (!student) return null;

    const results = await db.query.marks.findMany({
        where: eq(marks.studentId, student.id),
        with: {
            subject: true
        }
    });

    // Filter by semester in JS if needed or enhance query
    return results.filter(r => r.subject.semester === semester);
}

export async function uploadProfilePicture(base64Image: string) {
    const session = await getSession();
    if (!session || session.role !== "student") return { success: false, error: "Unauthorized" };

    try {
        await db.update(students)
            .set({ profilePicture: base64Image })
            .where(eq(students.userId, session.userId));

        revalidatePath("/student/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Upload error", e);
        return { success: false, error: "Failed to upload" };
    }
}

export async function deleteProfilePicture() {
    const session = await getSession();
    if (!session || session.role !== "student") return { success: false, error: "Unauthorized" };

    try {
        await db.update(students)
            .set({ profilePicture: null })
            .where(eq(students.userId, session.userId));

        revalidatePath("/student/dashboard");
        return { success: true };
    } catch (e) {
        console.error("Delete error", e);
        return { success: false, error: "Failed to delete" };
    }
}

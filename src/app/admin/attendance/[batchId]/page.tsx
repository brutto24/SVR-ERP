import { db } from "@/db";
import { academicBatches, students, attendance, users, classes } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import BatchAttendanceClient from "@/components/admin/BatchAttendanceClient";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Force dynamic
export const dynamic = "force-dynamic";

export default async function BatchAttendancePage({
    params,
    searchParams
}: {
    params: { batchId: string },
    searchParams: { view?: string; month?: string; semester?: string }
}) {
    const { batchId } = await params;
    const { view, month, semester } = await searchParams;

    // 1. Fetch Batch Details
    const batch = await db.query.academicBatches.findFirst({
        where: eq(academicBatches.id, batchId),
    });

    if (!batch) {
        notFound();
    }

    // 2. Fetch Students
    const studentsList = await db.select({
        id: students.id,
        name: users.name,
        registerNumber: students.registerNumber,
        className: classes.name,
        profilePicture: students.profilePicture,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(classes, eq(students.classId, classes.id))
        .where(eq(students.batchId, batchId))
        .orderBy(classes.name, students.registerNumber);

    // 3. Define Date Filter
    let dateFilter = undefined;

    // Default to month view if view is missing or explicitly month
    const effectiveView = view || "month";
    const effectiveMonth = month || new Date().toISOString().slice(0, 7);

    if (effectiveView === "month") {
        const startDate = new Date(`${effectiveMonth}-01`);
        // Set end date to last day of month
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        dateFilter = and(gte(attendance.date, startDate), lte(attendance.date, endDate));
    } else if (effectiveView === "semester" && semester) {
        // Parse semester format "1-1" = 1st year, 1st semester
        const [year, sem] = semester.split("-").map(Number);

        // Calculate semester index (0-based): (year-1)*2 + (sem-1)
        // 1-1 = 0, 1-2 = 1, 2-1 = 2, 2-2 = 3, etc.
        const semesterIndex = (year - 1) * 2 + (sem - 1);

        // Each semester is 6 months
        const batchStartDate = new Date(batch.startDate);
        const startDate = new Date(batchStartDate);
        startDate.setMonth(startDate.getMonth() + (semesterIndex * 6));

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 6);
        endDate.setDate(endDate.getDate() - 1); // Last day of semester
        endDate.setHours(23, 59, 59, 999);

        dateFilter = and(gte(attendance.date, startDate), lte(attendance.date, endDate));
    }

    // 4. Fetch Attendance Stats
    const attendanceStats = await db.select({
        studentId: attendance.studentId,
        totalClasses: sql<number>`count(*)`,
        presentClasses: sql<number>`sum(case when ${attendance.isPresent} then 1 else 0 end)`
    })
        .from(attendance)
        .where(and(
            sql`${attendance.studentId} IN ${studentsList.length > 0 ? studentsList.map(s => s.id) : ['dummy']}`,
            dateFilter
        ))
        .groupBy(attendance.studentId);

    // Create a map for easy lookup
    const statsMap = new Map();
    attendanceStats.forEach(stat => {
        statsMap.set(stat.studentId, {
            total: Number(stat.totalClasses),
            present: Number(stat.presentClasses)
        });
    });

    // Merge data
    const studentsWithAttendance = studentsList.map(student => {
        const stats = statsMap.get(student.id) || { total: 0, present: 0 };
        const percentage = stats.total > 0 ? Number(((stats.present / stats.total) * 100).toFixed(2)) : 0;

        return {
            ...student,
            stats,
            percentage
        };
    });

    return (
        <div className="space-y-6">
            <Breadcrumbs items={[
                { label: "Dashboard", href: "/admin/dashboard" },
                { label: "Attendance", href: "/admin/attendance" },
                { label: batch.name }
            ]} />
            <BatchAttendanceClient students={studentsWithAttendance} batch={batch} />
        </div>
    );
}

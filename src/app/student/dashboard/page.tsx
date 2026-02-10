
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { students, attendance, marks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClassTimetable } from "@/actions/timetable";
import StudentDashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession();
    if (!session || session.role !== "student") redirect("/login");

    const studentRecord = await db.query.students.findFirst({
        where: eq(students.userId, session.userId),
        with: {
            user: true,
            class: true,
            batch: true
        },
        columns: {
            id: true,
            registerNumber: true,
            cgpa: true,
            sgpa: true,
            currentSemester: true,
            profilePicture: true,
            mobileNumber: true,
            parentName: true,
            parentMobile: true,
            address: true,
            aadharNumber: true,
            apaarId: true
        }
    });

    if (!studentRecord) return <div className="p-8 text-center">Student record not found. Please contact admin.</div>;

    // Attendance Fetching & Aggregation
    const attRecords = await db.query.attendance.findMany({
        where: eq(attendance.studentId, studentRecord.id),
        with: { subject: true }
    });

    // Aggregation Logic (existing)
    const attendanceMap = new Map();
    const attendanceHistory = attRecords.map(r => ({
        id: r.id,
        date: r.date,
        period: r.period,
        subject: r.subject.name,
        status: r.isPresent ? "Present" : "Absent",
        semester: r.subject.semester
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const r of attRecords) {
        if (!attendanceMap.has(r.subjectId)) {
            attendanceMap.set(r.subjectId, {
                subject: r.subject.name,
                semester: r.subject.semester,
                total: 0,
                present: 0
            });
        }
        const entry = attendanceMap.get(r.subjectId);
        entry.total++;
        if (r.isPresent) entry.present++;
    }
    const attendanceStats = Array.from(attendanceMap.values()).map(a => ({
        ...a,
        percentage: a.total > 0 ? Math.round((a.present / a.total) * 100) : 0
    }));

    // Calculate Overall Attendance
    const totalClasses = attendanceStats.reduce((acc, curr) => acc + curr.total, 0);
    const totalPresent = attendanceStats.reduce((acc, curr) => acc + curr.present, 0);
    const overallAttendance = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    // Monthly Attendance Logic
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyRecords = attRecords.filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const monthlyTotal = monthlyRecords.length;
    const monthlyPresent = monthlyRecords.filter(r => r.isPresent).length;
    const monthlyAttendance = monthlyTotal > 0 ? Math.round((monthlyPresent / monthlyTotal) * 100) : 0;

    // Marks Fetching & Pivot

    const markRecords = await db.query.marks.findMany({
        where: eq(marks.studentId, studentRecord.id),
        with: { subject: true }
    });

    const marksMap = new Map();
    for (const m of markRecords) {
        if (!marksMap.has(m.subjectId)) {
            marksMap.set(m.subjectId, {
                subject: m.subject.name,
                subjectType: m.subject.type, // Added type
                internal: 0,
                external: 0,
                total: 0,
                semester: m.subject.semester,
                grade: "-",
                credits: m.subject.credits,
                mid1: 0,
                mid2: 0,
                lab_internal: 0,
                semester_external: 0,
                lab_external: 0
            });
        }
        const entry = marksMap.get(m.subjectId);

        // Store raw values
        if (m.type === "mid1") entry.mid1 = m.total;
        if (m.type === "mid2") entry.mid2 = m.total;
        if (m.type === "lab_internal") entry.lab_internal = m.total;
        if (m.type === "semester") entry.semester_external = m.total;
        if (m.type === "lab_external") entry.lab_external = m.total;
    }

    // Calculate Finals
    const marksList = Array.from(marksMap.values()).map((entry: any) => {
        let internalTotal = 0;
        let externalTotal = 0;

        if (entry.subjectType === "lab") {
            // Lab: Simple Sum (Internal 30 + External 70)
            internalTotal = entry.lab_internal || 0;
            externalTotal = entry.lab_external || 0;
        } else {
            // Theory: 80% of Best Mid + 20% of Other Mid
            const m1 = entry.mid1 || 0;
            const m2 = entry.mid2 || 0;
            const best = Math.max(m1, m2);
            const other = Math.min(m1, m2);

            // If both exist, apply 80-20. If only one, take it as is (or regulation might say 80% of it? Assuming straight for now if one missing, but usually 80-20 applies on attempted)
            // Actually standard practice: if absent for one, it counts as 0. So 80-20 works.
            internalTotal = Math.round((best * 0.8) + (other * 0.2));

            externalTotal = entry.semester_external || 0;
        }

        const total = internalTotal + externalTotal;

        // Calculate Grade (JNTU Standard R18/R22 approx)
        let grade = "F";
        if (total >= 90) grade = "O";
        else if (total >= 80) grade = "A+";
        else if (total >= 70) grade = "A";
        else if (total >= 60) grade = "B+";
        else if (total >= 50) grade = "B";
        else if (total >= 40) grade = "C";
        else grade = "F";

        // Fail conditions
        // 1. External < 35% of 70 (approx 24.5 -> 25)
        if (entry.subjectType === "theory" && externalTotal < 25) grade = "F";
        if (entry.subjectType === "lab" && externalTotal < 35) grade = "F"; // usually 50% for lab external? Let's generic to 35% for now or check regulations. standard is 35% external min and 40% total min.

        // 2. Total < 40%
        if (total < 40) grade = "F";

        return {
            ...entry,
            internal: internalTotal,
            external: externalTotal,
            total: total,
            grade: grade
        };
    });

    const timetableData = await getClassTimetable(studentRecord.class.id, studentRecord.currentSemester);

    return <StudentDashboardClient
        profile={{
            name: studentRecord.user.name,
            registerNumber: studentRecord.registerNumber,
            className: studentRecord.class.name,
            department: "AI",
            cgpa: studentRecord.cgpa || "0.0",
            sgpa: studentRecord.sgpa || "0.0",
            currentSemester: studentRecord.currentSemester,
            profilePicture: studentRecord.profilePicture,
            mobileNumber: studentRecord.mobileNumber || undefined,
            parentName: studentRecord.parentName || undefined,
            parentMobile: studentRecord.parentMobile || undefined,
            address: studentRecord.address || undefined,
            aadharNumber: studentRecord.aadharNumber || undefined,
            apaarId: studentRecord.apaarId || undefined,
        }}
        attendance={attendanceStats}
        overallAttendance={overallAttendance}
        monthlyAttendance={monthlyAttendance}
        attendanceHistory={attendanceHistory} // Pass detailed history
        marks={marksList}
        timetable={timetableData} // Pass timetable
    />;
}

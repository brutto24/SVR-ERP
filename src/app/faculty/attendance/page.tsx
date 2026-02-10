import { db } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { faculty, users, facultySubjects, subjects, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import AttendanceClient from "@/components/faculty/AttendanceClient";

export default async function AttendancePage() {
    const session = await getSession();
    if (!session || session.role !== 'faculty') {
        redirect('/login');
    }

    // Fetch Faculty ID
    // Fetch Faculty ID
    const facultyRecord = await db.select({
        id: faculty.id,
        userId: faculty.userId
    })
        .from(faculty)
        .where(eq(faculty.userId, session.userId))
        .limit(1)
        .then(res => res[0]);

    if (!facultyRecord) {
        return <div>Account setup issue. Contact admin.</div>;
    }

    // Fetch Assignments
    const assignments = await db.select({
        subjectName: subjects.name,
        subjectId: subjects.id,
        className: classes.name,
        classId: classes.id,
        semester: subjects.semester
    })
        .from(facultySubjects)
        .innerJoin(subjects, eq(facultySubjects.subjectId, subjects.id))
        .innerJoin(classes, eq(facultySubjects.classId, classes.id))
        .where(eq(facultySubjects.facultyId, facultyRecord.id));

    return (
        <AttendanceClient
            facultyId={facultyRecord.userId}
            assignments={assignments}
        />
    );
}

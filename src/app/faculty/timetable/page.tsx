import { db } from "@/db";
import { getSession } from "@/lib/auth";
import { users, faculty, facultySubjects, subjects, classes, timetable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import TimetableEditor from "../../../components/faculty/TimetableEditor";
import { getFacultyTimetable } from "@/actions/timetable";

export default async function FacultyTimetablePage() {
    const session = await getSession();
    if (!session?.userId || session.role !== "faculty") {
        redirect("/login");
    }

    // 1. Get Faculty ID
    const facultyRecord = await db.query.faculty.findFirst({
        where: eq(faculty.userId, session.userId),
        columns: { id: true, employeeId: true }
    });

    if (!facultyRecord) {
        return <div className="p-8 text-center text-red-500">Faculty record not found.</div>;
    }

    // 2. Get Assigned Subjects (for dropdowns)
    const assignments = await db.select({
        subjectId: subjects.id,
        subjectName: subjects.name,
        classId: classes.id,
        className: classes.name,
        batchId: subjects.batchId,
        semester: subjects.semester
    })
        .from(facultySubjects)
        .innerJoin(subjects, eq(facultySubjects.subjectId, subjects.id))
        .innerJoin(classes, eq(facultySubjects.classId, classes.id))
        .where(eq(facultySubjects.facultyId, facultyRecord.id))
        .execute();

    // 3. Get Current Timetable
    const currentTimetable = await getFacultyTimetable(facultyRecord.id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Class Schedule</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your weekly timetable. Changes are automatically saved.</p>
                </div>
            </div>



            <TimetableEditor
                facultyId={facultyRecord.id}
                initialTimetable={currentTimetable}
                assignments={assignments.map(a => ({
                    subjectId: a.subjectId,
                    subjectName: a.subjectName,
                    classId: a.classId,
                    className: a.className,
                    batchId: a.batchId,
                    semester: a.semester
                }))}
            />
        </div>
    );
}

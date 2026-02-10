import { db } from "@/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { faculty, users, facultySubjects, subjects, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import MarksEntryClient from "@/components/faculty/MarksEntryClient";

export default async function FacultyMarksPage() {
    const session = await getSession();
    if (!session || session.role !== 'faculty') {
        redirect('/login');
    }

    // Fetch Faculty ID
    const facultyRecord = await db.select({
        id: faculty.id
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
        subjectType: subjects.type,
        className: classes.name,
        classId: classes.id,
        semester: subjects.semester
    })
        .from(facultySubjects)
        .innerJoin(subjects, eq(facultySubjects.subjectId, subjects.id))
        .innerJoin(classes, eq(facultySubjects.classId, classes.id))
        .where(eq(facultySubjects.facultyId, facultyRecord.id));

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-pink-600 to-indigo-600">
                        Enter Marks
                    </h1>
                    <p className="text-gray-500 text-sm">Update mid-term and semester marks for your classes.</p>
                </div>
            </header>

            <MarksEntryClient
                facultyId={session.userId}
                assignments={assignments.map(a => ({
                    subjectId: a.subjectId,
                    subjectName: a.subjectName,
                    subjectType: a.subjectType,
                    classId: a.classId,
                    className: a.className,
                    semester: a.semester || "1-1"
                }))}
            />
        </div>
    );
}


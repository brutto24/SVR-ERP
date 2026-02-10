
import { db } from "@/db";
import { faculty, users, classTeachers, students, attendance, marks, subjects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import MyClassClient from "@/components/faculty/MyClassClient";

export default async function MyClassPage() {
    const session = await getSession();
    if (!session || session.role !== 'faculty') {
        redirect('/login');
    }

    // 1. Get Faculty ID
    const facultyRecord = await db.query.faculty.findFirst({
        where: eq(faculty.userId, session.userId),
        columns: { id: true }
        // Actually faculty table doesn't have name. Users table does.
        // We might need faculty name for display, but let's stick to ID for logic.
    });

    if (!facultyRecord) {
        return <div>Faculty profile not found.</div>;
    }

    // 2. Get Class Teacher Assignment
    const assignment = await db.query.classTeachers.findFirst({
        where: eq(classTeachers.facultyId, facultyRecord.id),
        with: {
            batch: true,
            class: true
        }
    });

    if (!assignment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Not Assigned</h2>
                    <p className="text-gray-500">
                        You have not been assigned as a Class Teacher for any batch/class.
                    </p>
                </div>
            </div>
        );
    }

    // 3. Fetch Students in the assigned Batch & Class
    const classStudents = await db.select({
        id: students.id,
        registerNumber: students.registerNumber,
        name: users.name,
        email: users.email,
        profilePicture: students.profilePicture, // Assuming this field exists
        status: students.status,
        currentSemester: students.currentSemester,
        cgpa: students.cgpa,
        attendancePercentage: students.attendancePercentage
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(
            and(
                eq(students.batchId, assignment.batchId),
                eq(students.classId, assignment.classId)
            )
        )
        .orderBy(students.registerNumber);

    // 4. Fetch Attendance Summary (Optional: for more detailed Month-wise or just pass simple stats)
    // We can fetch initial detailed data or let client fetch on demand.
    // For now, let's pass the student list which has 'attendancePercentage'.
    // We might need subject-wise attendance later.

    // 5. Fetch Marks (Overview)
    // We want to show a marks grid. We need all subjects for this batch/sem and marks for each student.
    // This can be heavy. Let's start with passing the Student List and let the Client fetch/calculate or we fetch here.
    // Fetching here is better for SEO/Speed.

    // Get all subjects for this batch (and current semester?)
    // Let's assume we show marks for "Current Semester" of the students.
    // But students might be in different semesters? No, a batch/class is usually in same sem.
    // We'll take the semester from the first student or the batch data?
    // Students table has 'currentSemester'.

    const semester = classStudents[0]?.currentSemester || "1-1";

    const batchSubjects = await db.query.subjects.findMany({
        where: and(
            eq(subjects.batchId, assignment.batchId),
            eq(subjects.semester, semester)
        )
    });

    // Fetch marks for these students and subjects
    // This is a bit complex. We can fetch ALL marks for these students and filter in JS.
    // Or fetch subject-wise.
    // Let's fetch all marks for these students for the current semester subjects.

    // Actually, MyClassClient will likely fetch details or we pass everything.
    // Let's pass students and subjects. Marks logic can be handled in a separate server action or fetch.
    // Or simplified: Just pass students and subjects.

    // Let's Fetch marks to pass as initial data.
    const allMarks = await db.select()
        .from(marks)
        .where(
            and(
                // Filter by students in this class
                // inArray(marks.studentId, classStudents.map(s => s.id)) // might be too many
                // eq(marks.type, 'semester') // or all types? User wants to see marks.
            )
        );
    // We should refine this query later if performance is user.

    return (
        <MyClassClient
            students={classStudents}
            batchName={assignment.batch.name}
            className={assignment.class.name}
            subjects={batchSubjects}
        />
    );
}


import { db } from "@/db";
import { faculty, users, classTeachers, students, attendance, marks, subjects } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
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
        profilePicture: students.profilePicture,
        status: students.status,
        currentSemester: students.currentSemester,
        cgpa: students.cgpa,
        attendancePercentage: students.attendancePercentage,
        // Added new fields
        mobileNumber: students.mobileNumber,
        parentName: students.parentName,
        parentMobile: students.parentMobile,
        address: students.address,
        aadharNumber: students.aadharNumber,
        apaarId: students.apaarId
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

    // 4. Fetch Attendance Stats (Real Calculation - All Semesters)
    const stats = await db.select({
        studentId: attendance.studentId,
        isPresent: attendance.isPresent,
        subjectId: attendance.subjectId,
        semester: subjects.semester
    })
        .from(attendance)
        .innerJoin(subjects, eq(attendance.subjectId, subjects.id))
        .where(
            inArray(attendance.studentId, classStudents.map(s => s.id))
        );

    // 5. Aggregate Attendance by Student & Semester
    const attendanceData: Record<string, Record<string, { total: number; present: number; absent: number; percentage: number }>> = {};

    classStudents.forEach(student => {
        attendanceData[student.id] = {};
        const studentRecords = stats.filter(r => r.studentId === student.id);

        // Group by semester
        studentRecords.forEach(r => {
            const sem = r.semester;
            if (!attendanceData[student.id][sem]) {
                attendanceData[student.id][sem] = { total: 0, present: 0, absent: 0, percentage: 0 };
            }
            attendanceData[student.id][sem].total++;
            if (r.isPresent) attendanceData[student.id][sem].present++;
        });

        // Calculate absent & percentage
        Object.keys(attendanceData[student.id]).forEach(sem => {
            const d = attendanceData[student.id][sem];
            d.absent = d.total - d.present;
            d.percentage = d.total > 0 ? Math.round((d.present / d.total) * 100) : 0;
        });
    });

    // 6. Fetch ALL Subjects for the batch
    const allSubjects = await db.query.subjects.findMany({
        where: eq(subjects.batchId, assignment.batchId)
    });

    // 7. Fetch Marks (All Types)
    const marksRecords = await db.select({
        studentId: marks.studentId,
        subjectId: marks.subjectId,
        type: marks.type,
        total: marks.total
    })
        .from(marks)
        .where(
            inArray(marks.studentId, classStudents.map(s => s.id))
        );

    // Aggregate Marks by Student & Subject & Type
    const marksData: Record<string, Record<string, Record<string, number>>> = {};

    classStudents.forEach(student => {
        marksData[student.id] = {};
        const studentMarks = marksRecords.filter(m => m.studentId === student.id);

        studentMarks.forEach(m => {
            if (!marksData[student.id][m.subjectId]) {
                marksData[student.id][m.subjectId] = {};
            }
            marksData[student.id][m.subjectId][m.type] = m.total;
        });
    });

    return (
        <MyClassClient
            students={classStudents}
            batchName={assignment.batch.name}
            className={assignment.class.name}
            allSubjects={allSubjects}
            attendanceData={attendanceData}
            marksData={marksData}
            canEdit={assignment.canEditStudentData}
            batchId={assignment.batchId}
            classId={assignment.classId}
        />
    );
}

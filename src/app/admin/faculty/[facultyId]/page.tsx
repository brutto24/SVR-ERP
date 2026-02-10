import { db } from "@/db";
import { faculty, users, facultySubjects, subjects, classes, students, academicBatches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ArrowLeft, BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";
import StudentPerformanceTable from "@/components/admin/StudentPerformanceTable";
import SubjectAssignmentManager from "@/components/admin/SubjectAssignmentManager";
import FacultyTimetable from "@/components/admin/FacultyTimetable";
import { getFacultyTimetable } from "@/actions/timetable";

export default async function FacultyProfilePage({ params }: { params: { facultyId: string } }) {
    const { facultyId } = await params;

    // 1. Fetch Faculty Details
    const facultyData = await db.select({
        id: faculty.id,
        name: users.name,
        email: users.email,
        employeeId: faculty.employeeId,
        designation: faculty.designation,
        department: faculty.department,
    })
        .from(faculty)
        .innerJoin(users, eq(faculty.userId, users.id))
        .where(eq(faculty.id, facultyId))
        .execute()
        .then((res: any[]) => res[0]);

    if (!facultyData) {
        return <div className="p-8 text-center text-red-500">Faculty member not found.</div>;
    }

    // 2. Fetch Assigned Subjects & Classes
    const assignments = await db.select({
        id: facultySubjects.id,
        subjectName: subjects.name,
        subjectCode: subjects.code,
        className: classes.name,
        classId: classes.id,
        subjectId: subjects.id,
        batchId: subjects.batchId, // Fetch batchId for student creation context
        semester: subjects.semester // Fetch semester
    })
        .from(facultySubjects)
        .innerJoin(subjects, eq(facultySubjects.subjectId, subjects.id))
        .innerJoin(classes, eq(facultySubjects.classId, classes.id))
        .where(eq(facultySubjects.facultyId, facultyId))
        .execute();

    // 3. Fetch Students for these classes
    // We'll group them by class for display
    const classIds = assignments.map(a => a.classId);
    let classStudents: Record<string, any[]> = {};

    if (classIds.length > 0) {
        // Fetch all students in these classes
        // Note: Drizzle's `inArray` might be needed but simple iteration works for separate queries if list is small, or one big query
        // Let's do one big query
        const allStudents = await db.select({
            id: students.id,
            name: users.name,
            rollNo: students.registerNumber,
            classId: students.classId,
            attendancePercentage: students.attendancePercentage,
            cgpa: students.cgpa,
            sgpa: students.sgpa
        })
            .from(students)
            .innerJoin(users, eq(students.userId, users.id))
            .innerJoin(classes, eq(students.classId, classes.id))
            // We really want students where classId is in our list
            // For simplicity in this demo without complex ORM helpers:
            .execute();

        // Filter in JS for now (optimization for later) or use inArray if available
        const relevantStudents = allStudents.filter(s => classIds.includes(s.classId));

        relevantStudents.forEach(stu => {
            if (!classStudents[stu.classId]) {
                classStudents[stu.classId] = [];
            }
            classStudents[stu.classId].push(stu);
        });
    }

    // 4. Fetch Meta Data for Assignment (All Subjects & Classes)
    const allSubjects = await db.select({ id: subjects.id, name: subjects.name, code: subjects.code, semester: subjects.semester, batchId: subjects.batchId }).from(subjects);
    const allClasses = await db.select({ id: classes.id, name: classes.name }).from(classes);
    const allBatches = await db.select({ id: academicBatches.id, name: academicBatches.name }).from(academicBatches).where(eq(academicBatches.isActive, true));

    // 5. Fetch Timetable
    const timetableEntries = await getFacultyTimetable(facultyId);

    return (
        <div className="space-y-8">
            {/* Header / Profile Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-full -z-0 opacity-50" />

                <Link href="/admin/faculty" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors z-10 relative">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Faculty List
                </Link>

                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{facultyData.name}</h1>
                            <p className="text-gray-500 mt-1">{facultyData.designation} • {facultyData.department}</p>
                            <div className="flex gap-4 mt-4 text-sm text-gray-600">
                                <span className="bg-gray-100 px-3 py-1 rounded-full">ID: {facultyData.employeeId}</span>
                                <span className="bg-gray-100 px-3 py-1 rounded-full">{facultyData.email}</span>
                            </div>
                        </div>
                        <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                            {facultyData.name.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Assigned Workload Overview (New Section) */}
            <div className="space-y-8">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            Weekly Schedule
                        </h2>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <FacultyTimetable
                                facultyId={facultyId}
                                initialTimetable={timetableEntries}
                                assignments={assignments.map(a => ({
                                    subjectId: a.subjectId,
                                    subjectName: a.subjectName,
                                    classId: a.classId,
                                    className: a.className,
                                    batchId: a.batchId,
                                    semester: a.semester || "1-1"
                                }))}
                            />
                        </div>
                    </div>

                    {/* Collapsible Student Lists */}
                    {assignments.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Class Performance & Attendance</h3>
                            <div className="space-y-4">
                                {assignments.map((assign, idx) => (
                                    <details key={idx} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm open:shadow-md transition-all">
                                        <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 list-none">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{assign.className}</h3>
                                                    <p className="text-sm text-gray-500">{assign.subjectName} ({assign.subjectCode})</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                                                    {classStudents[assign.classId]?.length || 0} Students
                                                </span>
                                                <div className="bg-gray-100 rounded-full p-1 group-open:rotate-180 transition-transform">
                                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </summary>

                                        <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                                            <div className="max-h-[500px] overflow-y-auto pr-2">
                                                <StudentPerformanceTable
                                                    initialStudents={classStudents[assign.classId] || []}
                                                    classId={assign.classId}
                                                    batchId={assign.batchId}
                                                />
                                            </div>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Quick stats & Assignment Controls */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-md font-bold text-gray-800 mb-4">Teaching Subjects</h3>

                        <SubjectAssignmentManager
                            facultyId={facultyId}
                            subjects={allSubjects}
                            classes={allClasses}
                            batches={allBatches}
                            assignments={assignments}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

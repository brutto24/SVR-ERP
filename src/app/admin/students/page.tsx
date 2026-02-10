import { db } from "@/db";
import { academicBatches, classes, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import StudentManager from "@/components/admin/StudentManager";

export default async function GlobalStudentsPage() {
    // For global students, we probably should group by class/batch or search.
    // For simplicity to fix the 404, we'll redirect to Batches or list all but allow user to filter.
    // Let's redirect to Batches for now as the most logical entry point for student management.
    // Or render a message.

    // Better: Render a searchable list of all students.
    const allStudents = await db.select({
        id: students.id,
        userId: students.userId,
        registerNumber: students.registerNumber,
        currentSemester: students.currentSemester,
        attendancePercentage: students.attendancePercentage,
        name: users.name,
        email: users.email,
        batchName: academicBatches.name,
        className: classes.name
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(academicBatches, eq(students.batchId, academicBatches.id))
        .innerJoin(classes, eq(students.classId, classes.id))
        .orderBy(students.registerNumber);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">All Students</h1>
                <p className="text-sm text-gray-500">Global Student Directory</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">ID</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Name</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Batch / Class</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-center">Semester</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {allStudents.map((stu) => (
                                <tr key={stu.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{stu.registerNumber}</td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{stu.name}</div>
                                            <div className="text-xs text-gray-400">{stu.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="font-medium text-indigo-600">{stu.batchName}</span>
                                        <span className="mx-2 text-gray-300">/</span>
                                        <span className="font-medium text-purple-600">{stu.className}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm text-gray-600">{stu.currentSemester}</td>
                                </tr>
                            ))}
                            {allStudents.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No students found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

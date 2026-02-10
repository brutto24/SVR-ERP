
import { db } from "@/db";
import { classes, academicBatches, students, users } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
// Explicit import check
import StudentManager from "@/components/admin/StudentManager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ClassStudentsPage(props: { params: Promise<{ batchId: string, classId: string }> }) {
    const params = await props.params;

    // Fetch Context
    const batch = await db.query.academicBatches.findFirst({ where: eq(academicBatches.id, params.batchId) });
    const cls = await db.query.classes.findFirst({ where: eq(classes.id, params.classId) });

    if (!batch || !cls) return <div>Resource not found</div>;

    // Fetch Students
    const rawStudents = await db.select({
        id: students.id,
        name: users.name,
        email: users.email,
        isActive: users.isActive,
        registerNumber: students.registerNumber,
        currentSemester: students.currentSemester,
        cgpa: students.cgpa,
        attendancePercentage: students.attendancePercentage,
        // New Fields
        mobileNumber: students.mobileNumber,
        parentName: students.parentName,
        parentMobile: students.parentMobile,
        address: students.address,
        aadharNumber: students.aadharNumber,
        apaarId: students.apaarId,
        userId: students.userId,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(and(
            eq(students.batchId, params.batchId),
            eq(students.classId, params.classId)
        ))
        .orderBy(asc(students.registerNumber))
        .execute();

    // Transform for Client Component
    const studentList = rawStudents.map(s => ({
        ...s,
        cgpa: s.cgpa || "0.0",
        attendancePercentage: s.attendancePercentage || 0,
    }));

    // Check Permissions
    const { getSession } = await import("@/lib/auth");
    const session = await getSession();
    const { faculty, classTeachers } = await import("@/db/schema");

    let canEdit = false;
    if (session?.role === "admin") {
        console.log("User is admin, enabling edit");
        canEdit = true;
    } else if (session?.role === "faculty") {
        // Check if this faculty is the class teacher for this class AND has permission
        const facultyRecord = await db.query.faculty.findFirst({
            where: eq(faculty.userId, session.userId),
            with: {
                classTeachers: {
                    where: and(
                        eq(classTeachers.classId, params.classId),
                        eq(classTeachers.batchId, params.batchId)
                    )
                }
            }
        });

        // Check if assigned and has permission
        if (facultyRecord?.classTeachers && facultyRecord.classTeachers.length > 0) {
            canEdit = facultyRecord.classTeachers[0].canEditStudentData;
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/batches/${params.batchId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="text-gray-600" size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Students <span className="text-gray-400">/</span> {cls.name}</h1>
                    <p className="text-sm text-gray-500">Batch: {batch.name}</p>
                </div>
            </div>

            <StudentManager
                batchId={params.batchId}
                classId={params.classId}
                students={studentList}
                canEdit={true}
            />
        </div>
    );
}


import { db } from "@/db";
import { classes, academicBatches, students, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
        registerNumber: students.registerNumber,
        attendancePercentage: students.attendancePercentage,
        userId: students.userId,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .where(and(
            eq(students.batchId, params.batchId),
            eq(students.classId, params.classId)
        ))
        .execute();

    // Transform for Client Component
    const studentList = rawStudents.map(s => ({
        ...s,
        attendancePercentage: s.attendancePercentage || 0
    }));

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
            />
        </div>
    );
}

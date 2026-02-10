import { db } from "@/db";
import { academicBatches, classes, students, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import StudentManager from "@/components/admin/StudentManager";

export default async function GlobalStudentsPage() {
    // Fetch all batches and classes for filters/dropdowns
    const allBatches = await db.query.academicBatches.findMany({
        orderBy: desc(academicBatches.startDate)
    });

    const allClasses = await db.query.classes.findMany();

    // Fetch all students with detailed info
    const allStudentsData = await db.select({
        id: students.id,
        userId: students.userId,
        registerNumber: students.registerNumber,
        currentSemester: students.currentSemester,
        attendancePercentage: students.attendancePercentage,
        cgpa: students.cgpa,

        // Detailed Info
        mobileNumber: students.mobileNumber,
        parentName: students.parentName,
        parentMobile: students.parentMobile,
        address: students.address,
        aadharNumber: students.aadharNumber,
        apaarId: students.apaarId,

        // Context
        batchId: students.batchId,
        classId: students.classId,
        batchName: academicBatches.name,
        className: classes.name,

        // User Info
        userName: users.name,
        userEmail: users.email
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(academicBatches, eq(students.batchId, academicBatches.id))
        .innerJoin(classes, eq(students.classId, classes.id))
        .orderBy(students.registerNumber);

    // Transform to match StudentManager expected shape
    const formattedStudents = allStudentsData.map(s => ({
        ...s,
        name: s.userName,
        user: {
            name: s.userName,
            email: s.userEmail
        }
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">All Students</h1>
                    <p className="text-sm text-gray-500">Global Student Directory - Mange all students across batches</p>
                </div>
            </div>

            <StudentManager
                students={formattedStudents}
                batches={allBatches}
                classes={allClasses}
                canEdit={true} // Admin always has permission on this page
            />
        </div>
    );
}

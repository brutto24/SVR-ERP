import { db } from "@/db";
import { faculty, users, academicBatches, classes, classTeachers } from "@/db/schema";
import { createFaculty } from "@/actions/admin";
import { eq } from "drizzle-orm";
import FacultyManager from "@/components/admin/FacultyManager";
import FacultyCreateForm from "@/components/admin/FacultyCreateForm";

export default async function FacultyPage() {
    const allFaculty = await db.select({
        id: faculty.id,
        name: users.name,
        email: users.email,
        designation: faculty.designation,
        department: faculty.department,
        employeeId: faculty.employeeId,
        isActive: users.isActive,
        // Class Teacher Details
        assignedBatchId: classTeachers.batchId,
        assignedClassId: classTeachers.classId,
        canEditStudentData: classTeachers.canEditStudentData,
    })
        .from(faculty)
        .innerJoin(users, eq(faculty.userId, users.id))
        .leftJoin(classTeachers, eq(faculty.id, classTeachers.facultyId))
        .execute();

    const batchesList = await db.select({ id: academicBatches.id, name: academicBatches.name })
        .from(academicBatches)
        .where(eq(academicBatches.isActive, true));

    const classesList = await db.select({ id: classes.id, name: classes.name, batchId: classes.batchId }).from(classes);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Faculty Management</h1>
                    <p className="text-sm text-gray-500">Manage faculty members and assignments</p>
                </div>
            </div>

            {/* Create Faculty Form (Client Component) */}
            <FacultyCreateForm batches={batchesList} classes={classesList} />

            {/* Interactive Client List for Edit/Delete */}
            <FacultyManager
                facultyList={allFaculty}
                batches={batchesList}
                classes={classesList}
            />
        </div>
    );
}

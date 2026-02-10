"use server";

import { db } from "@/db";
import { academicBatches, classes, subjects, users, students, faculty, facultySubjects, timetable, classTeachers, attendance, marks } from "@/db/schema";
import { eq, and, not } from "drizzle-orm";
import { encryptPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// --- BATCH MANAGEMENT ---
export async function createBatch(data: { name: string; startDate: Date; endDate: Date }) {
    try {
        await db.insert(academicBatches).values({
            id: crypto.randomUUID(),
            name: data.name,
            startDate: data.startDate,
            endDate: data.endDate,
        });
        revalidatePath("/admin/batches");
        return { success: true };
    } catch (error) {
        console.error("Failed to create batch:", error);
        return { success: false, error: "Failed to create batch" };
    }
}

export async function updateBatch(batchId: string, data: { name: string; isActive: boolean }) {
    try {
        await db.update(academicBatches)
            .set({ name: data.name, isActive: data.isActive })
            .where(eq(academicBatches.id, batchId));
        revalidatePath("/admin/batches");
        return { success: true };
    } catch (error) {
        console.error("Failed to update batch:", error);
        return { success: false, error: "Failed to update batch" };
    }
}

export async function deleteBatch(batchId: string) {
    try {
        await db.transaction(async (tx) => {
            // 1. Delete Class Teacher Assignments (Linked to Batch)
            await tx.delete(classTeachers).where(eq(classTeachers.batchId, batchId));

            // 2. Delete Timetable Entries (Linked to Batch)
            await tx.delete(timetable).where(eq(timetable.batchId, batchId));

            // 3. Delete Subjects linked to this Batch (and related faculty assignments)
            const batchSubjects = await tx.select({ id: subjects.id }).from(subjects).where(eq(subjects.batchId, batchId));
            if (batchSubjects.length > 0) {
                const subjectIds = batchSubjects.map(s => s.id);
                // Delete faculty assignments for these subjects
                for (const sub of batchSubjects) {
                    await tx.delete(facultySubjects).where(eq(facultySubjects.subjectId, sub.id));
                    // Also delete attendance/marks linked to subjects if any (though usually linked to student too)
                    await tx.delete(attendance).where(eq(attendance.subjectId, sub.id));
                    await tx.delete(marks).where(eq(marks.subjectId, sub.id));
                }
                // Delete subjects
                await tx.delete(subjects).where(eq(subjects.batchId, batchId));
            }

            // 4. Delete Students linked to this Batch
            const batchStudents = await tx.select({ id: students.id, userId: students.userId }).from(students).where(eq(students.batchId, batchId));

            for (const stu of batchStudents) {
                // Delete dependent data for student first
                await tx.delete(attendance).where(eq(attendance.studentId, stu.id));
                await tx.delete(marks).where(eq(marks.studentId, stu.id));

                // Delete Student record
                await tx.delete(students).where(eq(students.id, stu.id));
                // Delete User record
                await tx.delete(users).where(eq(users.id, stu.userId));
            }

            // 5. Delete Batch
            await tx.delete(academicBatches).where(eq(academicBatches.id, batchId));
        });

        revalidatePath("/admin/batches");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete batch:", error);
        return { success: false, error: "Failed to delete batch. Check server logs." };
    }
}

// --- CLASS MANAGEMENT ---
export async function createClass(name: string, batchId: string) {
    try {
        await db.insert(classes).values({
            id: crypto.randomUUID(),
            name,
            batchId
        });
        revalidatePath(`/admin/batches/${batchId}`); // Revalidate specific batch view
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to create class" };
    }
}

export async function updateClass(classId: string, name: string) {
    try {
        await db.update(classes)
            .set({ name })
            .where(eq(classes.id, classId));
        revalidatePath("/admin/batches"); // We might need batchId to revalidate specific path correctly, but generic path might cover it if layout/page uses it. Or we accept batchId here too to be precise.
        // For now, revalidating the list of batches might not be enough if we are inside a batch detail.
        // But revalidatePath works on the path string.
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update class" };
    }
}

export async function deleteClass(classId: string) {
    try {
        // 1. Block if Students exist (Critical Data protection)
        const studentCount = await db.select({ count: students.id }).from(students).where(eq(students.classId, classId)).limit(1);
        if (studentCount.length > 0) return { success: false, error: "Cannot delete class: It has active STUDENTS. Please remove them first." };

        // 2. Cascade Delete Metadata (Timetable & Assignments)
        await db.transaction(async (tx) => {
            // Delete Timetable entries
            await tx.delete(timetable).where(eq(timetable.classId, classId));

            // Delete Faculty Assignments
            await tx.delete(facultySubjects).where(eq(facultySubjects.classId, classId));

            // Delete the Class itself
            await tx.delete(classes).where(eq(classes.id, classId));
        });

        revalidatePath("/admin/batches");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete class:", error);
        return { success: false, error: "Failed to delete class (Database Error)" };
    }
}

// --- SUBJECT MANAGEMENT ---
export async function createSubject(data: { name: string; code: string; batchId: string; semester: string; credits: number; type: "theory" | "lab" }): Promise<{ success: true; id: string } | { success: false; error: string }> {
    try {
        const id = crypto.randomUUID();
        await db.insert(subjects).values({
            id,
            ...data,
        });
        revalidatePath("/admin/subjects");
        return { success: true, id };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create subject" };
    }
}


export async function updateSubject(subjectId: string, data: { name: string; code: string; type: "theory" | "lab"; credits: number; semester: string }) {
    try {
        await db.update(subjects)
            .set({
                name: data.name,
                code: data.code,
                type: data.type,
                credits: data.credits,
                semester: data.semester
            })
            .where(eq(subjects.id, subjectId));
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        console.error("Failed to update subject:", error);
        return { success: false, error: "Failed to update subject" };
    }
}

export async function deleteSubject(subjectId: string, force: boolean = false) {
    try {
        // 1. Check for Critical Data Dependencies (Attendance & Marks)
        const attendanceCount = await db.select({ id: attendance.id }).from(attendance).where(eq(attendance.subjectId, subjectId)).limit(1);
        const marksCount = await db.select({ id: marks.id }).from(marks).where(eq(marks.subjectId, subjectId)).limit(1);

        const hasData = attendanceCount.length > 0 || marksCount.length > 0;

        if (hasData && !force) {
            return {
                success: false,
                requiresConfirmation: true,
                error: "Subject has associated student data (Attendance/Marks). Deleting it will permanently remove this data."
            };
        }

        await db.transaction(async (tx) => {
            // 2. Cascade Delete Configuration Data (Assignments & Timetable)
            // It is safe to remove these as they are future-planning or current config, not historical student performance data.
            await tx.delete(timetable).where(eq(timetable.subjectId, subjectId));
            await tx.delete(facultySubjects).where(eq(facultySubjects.subjectId, subjectId));

            if (force) {
                // Delete Attendance & Marks if forced
                await tx.delete(attendance).where(eq(attendance.subjectId, subjectId));
                await tx.delete(marks).where(eq(marks.subjectId, subjectId));
            }

            // 3. Delete the Subject
            await tx.delete(subjects).where(eq(subjects.id, subjectId));
        });

        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete subject:", error);
        return { success: false, error: "Failed to delete subject (Database Error)" };
    }
}

// --- USER MANAGEMENT ---
export async function createStudent(data: {
    name: string;
    // email: string; // Removed as per user request
    registerNumber: string;
    batchId: string;
    classId: string;
    currentSemester: string
}) {
    try {
        const hashedPassword = await encryptPassword(data.registerNumber); // Default password is Register Number
        const userId = crypto.randomUUID();
        const generatedEmail = `${data.registerNumber.toLowerCase()}@student.svr.edu`; // Auto-generate email

        // Transaction ideally
        await db.transaction(async (tx) => {
            await tx.insert(users).values({
                id: userId,
                email: generatedEmail,
                password: hashedPassword,
                name: data.name,
                role: "student",
                mustChangePassword: true, // Force password change on first login
            });

            await tx.insert(students).values({
                id: crypto.randomUUID(),
                userId: userId,
                registerNumber: data.registerNumber,
                batchId: data.batchId,
                classId: data.classId,
                currentSemester: data.currentSemester,
            });
        });

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to create student (ID might be duplicate)" };
    }
}

export async function updateStudent(
    studentId: string,
    data: {
        name: string;
        // email: string; 
        registerNumber: string;
        currentSemester: string;
    }
) {
    try {
        const studentRecord = await db.query.students.findFirst({
            where: eq(students.id, studentId),
            with: { user: true }
        });

        if (!studentRecord) return { success: false, error: "Student not found" };

        const generatedEmail = `${data.registerNumber.toLowerCase()}@student.svr.edu`;

        await db.transaction(async (tx) => {
            // Check if Register Number changed (simple check usually, but safely we overwrite password if requested)
            // User requested: "if the admin change the student id... password should be update"
            // We should check previous record. `studentRecord` has current data.

            const isIdChanged = studentRecord.registerNumber !== data.registerNumber;
            const updateData: any = {
                name: data.name,
                email: generatedEmail
            };

            if (isIdChanged) {
                // Update password to new Register Number
                updateData.password = await encryptPassword(data.registerNumber);
                updateData.mustChangePassword = true; // Force change again since it's a "new" identity
            }

            // Update User details
            await tx.update(users)
                .set(updateData)
                .where(eq(users.id, studentRecord.userId));

            // Update Student details
            await tx.update(students)
                .set({
                    registerNumber: data.registerNumber,
                    currentSemester: data.currentSemester,
                })
                .where(eq(students.id, studentId));
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/batches"); // Covers the nested student list views
        return { success: true };
    } catch (error) {
        console.error("Failed to update student:", error);
        return { success: false, error: "Failed to update student" };
    }
}

export async function createFaculty(data: {
    name: string;
    // email: string; // Removed email arg
    employeeId: string;
    designation: string;
    department: string;
    roleType?: "subject_teacher" | "class_teacher";
    batchId?: string;
    classId?: string;
}) {
    try {
        const hashedPassword = await encryptPassword(data.employeeId); // Default password is Employee ID
        const userId = crypto.randomUUID();
        const generatedEmail = `${data.employeeId.toLowerCase()}@faculty.svr.edu`;
        const facultyId = crypto.randomUUID();

        await db.transaction(async (tx) => {
            await tx.insert(users).values({
                id: userId,
                email: generatedEmail,
                password: hashedPassword,
                name: data.name,
                role: "faculty",
                mustChangePassword: true, // Force password change
            });

            await tx.insert(faculty).values({
                id: facultyId,
                userId: userId,
                employeeId: data.employeeId,
                designation: data.designation,
                department: data.department,
            });

            // Handle Class Teacher Assignment
            if (data.roleType === "class_teacher" && data.batchId && data.classId) {
                // Check if class already has a teacher? Unique constraint will handle it, but we should catch error.
                // Or we can check first.
                // Let's rely on DB constraint for now or check.
                // Constraint: uniqueClassTeacher: unique().on(t.batchId, t.classId)

                // We need to import classTeachers from schema inside the function or file
                // It is imported in the file? I need to check imports.
                // Assuming I need to add it to imports.

                await tx.insert(classTeachers).values({
                    id: crypto.randomUUID(),
                    facultyId: facultyId,
                    batchId: data.batchId,
                    classId: data.classId
                });
            }
        });

        revalidatePath("/admin/users");
        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error: any) {
        console.error("Create Faculty Error:", error);
        if (error.code === '23505' && error.constraint === 'class_teachers_unique') {
            return { success: false, error: "This class already has a assigned Class Teacher." };
        }
        return { success: false, error: "Failed to create faculty (ID might be duplicate or other error)" };
    }
}

export async function updateFaculty(
    facultyId: string,
    data: {
        name: string;
        // email: string;
        employeeId: string;
        designation: string;
        department: string;
        roleType?: "subject_teacher" | "class_teacher";
        batchId?: string;
        classId?: string;
    }
) {
    try {
        const facultyRecord = await db.query.faculty.findFirst({
            where: eq(faculty.id, facultyId),
            with: { user: true }
        });

        if (!facultyRecord) return { success: false, error: "Faculty not found" };

        const generatedEmail = `${data.employeeId.toLowerCase()}@faculty.svr.edu`;

        await db.transaction(async (tx) => {

            const isIdChanged = facultyRecord.employeeId !== data.employeeId;
            const updateData: any = {
                name: data.name,
                email: generatedEmail
            };

            if (isIdChanged) {
                updateData.password = await encryptPassword(data.employeeId);
                updateData.mustChangePassword = true;
            }

            // 1. Update User
            await tx.update(users)
                .set(updateData)
                .where(eq(users.id, facultyRecord.userId));

            // 2. Update Faculty Details
            await tx.update(faculty)
                .set({
                    employeeId: data.employeeId,
                    designation: data.designation,
                    department: data.department,
                })
                .where(eq(faculty.id, facultyId));

            // 3. Handle Role/Class Teacher Assignment
            // First, remove existing class teacher assignment for this faculty
            await tx.delete(classTeachers).where(eq(classTeachers.facultyId, facultyId));

            // If new role is Class Teacher, add new assignment
            if (data.roleType === "class_teacher" && data.batchId && data.classId) {
                // Check uniqueness: Is this class already assigned to someone else?
                // We could check DB or rely on constraint.
                // Constraint "class_teachers_unique" covers (batchId, classId).
                // But we just deleted OUR assignment. If someone ELSE has it, it will fail.
                await tx.insert(classTeachers).values({
                    id: crypto.randomUUID(),
                    facultyId: facultyId,
                    batchId: data.batchId,
                    classId: data.classId
                });
            }
        });

        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update faculty:", error);
        if (error.code === '23505' && error.constraint === 'class_teachers_unique') {
            return { success: false, error: "This class already has an assigned Class Teacher." };
        }
        return { success: false, error: "Failed to update faculty" };
    }
}

export async function deleteFaculty(facultyId: string, force: boolean = false) {
    try {
        const facultyRecord = await db.query.faculty.findFirst({
            where: eq(faculty.id, facultyId),
        });

        if (!facultyRecord) return { success: false, error: "Faculty not found" };

        // 0. Check for critical data (Attendance marked by this user)
        const markedAttendance = await db.select({ id: attendance.id }).from(attendance).where(eq(attendance.markedBy, facultyRecord.userId)).limit(1);

        // If data exists and NOT forced, ask for confirmation
        if (markedAttendance.length > 0 && !force) {
            return {
                success: false,
                requiresConfirmation: true,
                error: "This faculty has marked student attendance. We suggest deactivating them instead to preserve data integrity."
            };
        }

        await db.transaction(async (tx) => {
            // 1. Remove Class Teacher Assignment
            await tx.delete(classTeachers).where(eq(classTeachers.facultyId, facultyId));

            // 2. Remove Subject Assignments
            await tx.delete(facultySubjects).where(eq(facultySubjects.facultyId, facultyId));

            // 3. Delete Faculty Profile
            await tx.delete(faculty).where(eq(faculty.id, facultyId));

            // 4. Delete User Login
            await tx.delete(users).where(eq(users.id, facultyRecord.userId));
        });

        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete faculty:", error);
        return { success: false, error: "Failed to delete faculty (Database Constraint Error)" };
    }
}

export async function toggleFacultyStatus(facultyId: string, currentStatus: boolean) {
    try {
        const facultyRecord = await db.query.faculty.findFirst({
            where: eq(faculty.id, facultyId),
        });

        if (!facultyRecord) return { success: false, error: "Faculty not found" };

        await db.update(users)
            .set({ isActive: !currentStatus })
            .where(eq(users.id, facultyRecord.userId));

        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status:", error);
        return { success: false, error: "Failed to toggle status" };
    }
}

// --- FACULTY ASSIGNMENT ---
export async function assignSubjectToFaculty(facultyId: string, subjectId: string, classId: string) {
    try {
        await db.insert(facultySubjects).values({
            id: crypto.randomUUID(),
            facultyId,
            subjectId,
            classId,
        });
        revalidatePath(`/admin/faculty/${facultyId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to assign subject:", error);
        return { success: false, error: "Failed to assign subject" };
    }
}

// --- STUDENT PERFORMANCE ---
export async function updateStudentStats(studentId: string, data: { attendance: number; cgpa: string; sgpa: string }) {
    try {
        await db.update(students)
            .set({
                attendancePercentage: data.attendance,
                cgpa: data.cgpa,
                sgpa: data.sgpa,
            })
            .where(eq(students.id, studentId));

        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error) {
        console.error("Failed to update student stats:", error);
        return { success: false, error: "Failed to update stats" };
    }
}

export async function deleteStudent(studentId: string) {
    try {
        const studentRecord = await db.query.students.findFirst({
            where: eq(students.id, studentId),
        });

        if (!studentRecord) return { success: false, error: "Student not found" };

        await db.transaction(async (tx) => {
            // Delete related records (marks, attendance) first if they existed - for now just student/user
            await tx.delete(students).where(eq(students.id, studentId));
            await tx.delete(users).where(eq(users.id, studentRecord.userId));
        });

        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete student:", error);
        return { success: false, error: "Failed to delete student" };
    }
}

export async function adminResetPassword(studentId: string) {
    try {
        console.log("Resetting password for student ID:", studentId);

        const studentRecord = await db.query.students.findFirst({
            where: eq(students.id, studentId),
            with: { user: true }
        });

        if (!studentRecord) {
            console.error("Student not found:", studentId);
            return { success: false, error: "Student not found" };
        }

        if (!studentRecord.registerNumber) {
            console.error("Student has no register number:", studentId);
            return { success: false, error: "Student has no register number" };
        }

        console.log("Resetting password to register number:", studentRecord.registerNumber);

        // Reset to Register Number
        const hashedPassword = await encryptPassword(studentRecord.registerNumber);

        await db.update(users)
            .set({
                password: hashedPassword,
                mustChangePassword: true // Force them to change it again
            })
            .where(eq(users.id, studentRecord.userId));

        console.log("Password reset successful for user:", studentRecord.userId);

        revalidatePath("/admin/users");
        return { success: true };
    } catch (error) {
        console.error("Failed to reset password:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
        return { success: false, error: errorMessage };
    }
}

export async function adminResetFacultyPassword(facultyId: string) {
    try {
        const facultyRecord = await db.query.faculty.findFirst({
            where: eq(faculty.id, facultyId),
            with: { user: true }
        });

        if (!facultyRecord) return { success: false, error: "Faculty not found" };

        const hashedPassword = await encryptPassword(facultyRecord.employeeId);

        await db.update(users)
            .set({
                password: hashedPassword,
                mustChangePassword: true
            })
            .where(eq(users.id, facultyRecord.userId));

        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to reset password" };
    }
}

export async function removeFacultyAssignment(id: string) {
    try {
        await db.delete(facultySubjects).where(eq(facultySubjects.id, id));
        // We revalidate both individual faculty and the list, but page.tsx uses facultyId
        // We don't have facultyId here easily. 
        // We will just revalidate the generic path or rely on client router.refresh() 
        // Calling revalidatePath for ALL faculty pages is expensive/impossible via wildcards? 
        // Actually we can revalidate "/admin/faculty/[id]" if we pass it, but simpler to rely on client refresh or general revalidate.
        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error) {
        console.error("Failed to remove assignment:", error);
        return { success: false, error: "Failed to remove assignment" };
    }
}

export async function updateFacultyAssignment(id: string, subjectId: string, classId: string) {
    try {
        // First, check if this subject+class is already assigned to another faculty
        const existingAssignment = await db.query.facultySubjects.findFirst({
            where: and(
                eq(facultySubjects.subjectId, subjectId),
                eq(facultySubjects.classId, classId),
                not(eq(facultySubjects.id, id)) // Exclude current assignment
            ),
            with: {
                faculty: {
                    with: {
                        user: true
                    }
                }
            }
        });

        if (existingAssignment) {
            const facultyName = existingAssignment.faculty.user.name;
            return {
                success: false,
                error: `This subject is already assigned to ${facultyName} for this class. Please remove their assignment first.`
            };
        }

        await db.update(facultySubjects)
            .set({ subjectId, classId })
            .where(eq(facultySubjects.id, id));
        revalidatePath("/admin/faculty");
        return { success: true };
    } catch (error) {
        console.error("Failed to update assignment:", error);
        return { success: false, error: "Failed to update assignment" };
    }
}




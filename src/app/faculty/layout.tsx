import Link from "next/link";
import { logout } from "@/actions/auth";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users, faculty, classTeachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import ForcePasswordChangeAPI from "@/components/ForcePasswordChangeAPI";

import MobileNav from "@/components/MobileNav";
import FacultySidebar from "@/components/faculty/Sidebar";

export default async function FacultyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    let mustChangePassword = false;
    let classTeacherData = null;

    if (session?.userId) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.userId),
            columns: { mustChangePassword: true }
        });
        mustChangePassword = user?.mustChangePassword || false;

        // Check if faculty is a Class Teacher
        const facultyRecord = await db.query.faculty.findFirst({
            where: eq(faculty.userId, session.userId),
            columns: { id: true }
        });

        if (facultyRecord) {
            const assignment = await db.query.classTeachers.findFirst({
                where: eq(classTeachers.facultyId, facultyRecord.id),
                with: {
                    batch: true,
                    class: true
                }
            });

            if (assignment) {
                classTeacherData = {
                    batchId: assignment.batchId,
                    classId: assignment.classId,
                    batchName: assignment.batch.name,
                    className: assignment.class.name
                };
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <ForcePasswordChangeAPI mustChangePassword={mustChangePassword} />

            {/* Mobile Nav */}
            <MobileNav title="SVR Faculty">
                <FacultySidebar classTeacherData={classTeacherData} />
            </MobileNav>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 shadow-sm z-50">
                <div className="p-6 border-b border-gray-50">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                        SVR Faculty
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Staff Portal</p>
                </div>
                <div className="p-4 h-[calc(100vh-85px)]">
                    <FacultySidebar classTeacherData={classTeacherData} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-0 md:ml-64 flex-1 p-4 md:p-8 transition-all duration-300">
                <div className="max-w-5xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}



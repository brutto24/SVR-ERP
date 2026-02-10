
import { db } from "@/db";
import { users, students, academicBatches, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentDashboardView from "@/components/student/StudentDashboardView";

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/login");
  }

  const studentRecord = await db.query.students.findFirst({
    where: eq(students.userId, session.userId),
    with: {
      user: true,
      batch: true,
      class: true
    }
  });

  if (!studentRecord) {
    return <div>Student record not found. Please contact administrator.</div>;
  }

  // Format data for view
  const studentData = {
    id: studentRecord.id,
    name: studentRecord.user.name,
    email: studentRecord.user.email,
    registerNumber: studentRecord.registerNumber,
    currentSemester: studentRecord.currentSemester,
    cgpa: studentRecord.cgpa || "0.0",
    attendancePercentage: studentRecord.attendancePercentage || 0,
    batchName: studentRecord.batch.name,
    className: studentRecord.class.name,
    // Full details
    mobileNumber: studentRecord.mobileNumber || undefined,
    parentName: studentRecord.parentName || undefined,
    parentMobile: studentRecord.parentMobile || undefined,
    address: studentRecord.address || undefined,
    aadharNumber: studentRecord.aadharNumber || undefined,
    apaarId: studentRecord.apaarId || undefined,
  };

  return <StudentDashboardView student={studentData} />;
}

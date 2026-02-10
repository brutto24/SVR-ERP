import { db } from "@/db";
import { faculty, users, facultySubjects, subjects, classes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getFacultyTimetable } from "@/actions/timetable";
import FacultyDashboardClient from "@/components/faculty/FacultyDashboardClient";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FacultyPage() {
  const session = await getSession();
  if (!session || session.role !== 'faculty') {
    redirect('/login');
  }

  const facultyRecord = await db.select({
    id: faculty.id,
    name: users.name,
    designation: faculty.designation,
    userId: faculty.userId
  })
    .from(faculty)
    .innerJoin(users, eq(faculty.userId, users.id))
    .where(eq(faculty.userId, session.userId))
    .limit(1)
    .then(res => res[0]);

  if (!facultyRecord) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Account Not Found</h1>
          <p className="text-gray-600 mb-4">
            Your user account is working, but no associated Faculty Profile was found in the database.
          </p>
          <p className="text-sm text-gray-500">
            User ID: {session.userId}
          </p>
        </div>
      </div>
    );
  }

  // Fetch Assignments
  const assignments = await db.select({
    subjectName: subjects.name,
    subjectCode: subjects.code,
    className: classes.name,
    classId: classes.id,
    subjectId: subjects.id,
    batchId: subjects.batchId,
    semester: subjects.semester,
  })
    .from(facultySubjects)
    .innerJoin(subjects, eq(facultySubjects.subjectId, subjects.id))
    .innerJoin(classes, eq(facultySubjects.classId, classes.id))
    .where(eq(facultySubjects.facultyId, facultyRecord.id));

  // Get Timetable
  const initialTimetable = await getFacultyTimetable(facultyRecord.id);

  return (
    <FacultyDashboardClient
      faculty={facultyRecord}
      initialTimetable={initialTimetable}
      assignments={assignments}
    />
  );
}

import { db } from "@/db";
import { academicBatches, students, marks, users, classes, subjects } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import BatchMarksClient from "@/components/admin/BatchMarksClient";

// Force dynamic
export const dynamic = "force-dynamic";

export default async function BatchMarksPage({
    params,
    searchParams
}: {
    params: { batchId: string },
    searchParams: { semester?: string }
}) {
    const { batchId } = await params;
    const { semester } = await searchParams;

    // 1. Fetch Batch Details
    const batch = await db.query.academicBatches.findFirst({
        where: eq(academicBatches.id, batchId),
    });

    if (!batch) {
        notFound();
    }

    // Determine current semester if not provided
    const calculateCurrentSemester = () => {
        const startDate = new Date(batch.startDate);
        const today = new Date();
        const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());
        let semesterIndex = Math.floor(monthsDiff / 6) + 1;
        semesterIndex = Math.max(1, Math.min(8, semesterIndex));
        const year = Math.ceil(semesterIndex / 2);
        const sem = semesterIndex % 2 === 0 ? 2 : 1;
        return `${year}-${sem}`;
    };

    const currentSemester = semester || calculateCurrentSemester();

    // 2. Fetch Subjects for this Semester & Batch
    const semesterSubjects = await db.select()
        .from(subjects)
        .where(and(
            eq(subjects.batchId, batchId),
            eq(subjects.semester, currentSemester)
        ))
        .orderBy(subjects.code);

    // 3. Fetch Students
    const studentsList = await db.select({
        id: students.id,
        name: users.name,
        registerNumber: students.registerNumber,
        className: classes.name,
        sgpa: students.sgpa,
        cgpa: students.cgpa,
    })
        .from(students)
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(classes, eq(students.classId, classes.id))
        .where(eq(students.batchId, batchId))
        .orderBy(classes.name, students.registerNumber);

    // 4. Fetch ALL Marks for these students and subjects (all types)
    const marksData = await db.select()
        .from(marks)
        .where(
            and(
                sql`${marks.studentId} IN ${studentsList.length > 0 ? studentsList.map(s => s.id) : ['dummy']}`,
                sql`${marks.subjectId} IN ${semesterSubjects.length > 0 ? semesterSubjects.map(s => s.id) : ['dummy']}`
            )
        );

    // Helper function to calculate grade
    const calculateGrade = (total: number): string => {
        if (total >= 90) return 'O';
        if (total >= 80) return 'A+';
        if (total >= 70) return 'A';
        if (total >= 60) return 'B+';
        if (total >= 50) return 'B';
        if (total >= 40) return 'C';
        return 'F';
    };

    // Process marks - organize by student -> subject -> type
    const studentMarksMap = new Map();
    const studentDetailedMarksMap = new Map(); // For modal

    studentsList.forEach(student => {
        studentMarksMap.set(student.id, {});
        studentDetailedMarksMap.set(student.id, {});
    });

    // Group marks by student and subject
    marksData.forEach(mark => {
        const studentMap = studentMarksMap.get(mark.studentId);
        const detailedMap = studentDetailedMarksMap.get(mark.studentId);

        if (studentMap && detailedMap) {
            // For table view: prioritize semester/lab_external for display
            const existing = studentMap[mark.subjectId];
            const isFinal = mark.type === 'semester' || mark.type === 'lab_external';

            if (!existing || isFinal) {
                studentMap[mark.subjectId] = {
                    total: mark.total,
                    type: mark.type,
                    grade: calculateGrade(mark.total)
                };
            }

            // For detail view: store all types
            if (!detailedMap[mark.subjectId]) {
                detailedMap[mark.subjectId] = {
                    internal: 0,
                    external: 0,
                    total: 0,
                    grade: 'F'
                };
            }

            // Map each type to the detailed structure
            if (mark.type === 'mid1') {
                detailedMap[mark.subjectId].mid1 = mark.total;
            } else if (mark.type === 'mid2') {
                detailedMap[mark.subjectId].mid2 = mark.total;
            } else if (mark.type === 'lab_internal') {
                detailedMap[mark.subjectId].labInternal = mark.total;
                detailedMap[mark.subjectId].internal = mark.total;
            } else if (mark.type === 'semester') {
                detailedMap[mark.subjectId].semesterExternal = mark.total;
                detailedMap[mark.subjectId].external = mark.total;
            } else if (mark.type === 'lab_external') {
                detailedMap[mark.subjectId].labExternal = mark.total;
                detailedMap[mark.subjectId].external = mark.total;
            }

            // Store assignment if available
            if (mark.assignment) {
                detailedMap[mark.subjectId].assignment = mark.assignment;
            }

            // Calculate internal total for theory subjects
            const subject = semesterSubjects.find(s => s.id === mark.subjectId);
            if (subject?.type === 'theory' && mark.type === 'mid1') {
                const data = detailedMap[mark.subjectId];
                const mid1 = data.mid1 || 0;
                const mid2 = data.mid2 || 0;
                const assignment = data.assignment || 0;
                // Simplified: average of mids (80%) + assignment (20%)
                data.internal = Math.round((mid1 + mid2) / 2 * 0.8 + assignment * 0.2);
            }

            // Store final total and grade from semester/lab_external marks
            if (isFinal) {
                detailedMap[mark.subjectId].total = mark.total;
                detailedMap[mark.subjectId].grade = calculateGrade(mark.total);
            }
        }
    });

    const studentsWithMarks = studentsList.map(student => ({
        ...student,
        sgpa: student.sgpa || "0.0",
        cgpa: student.cgpa || "0.0",
        marks: studentMarksMap.get(student.id) || {},
        detailedMarks: studentDetailedMarksMap.get(student.id) || {}
    }));

    return (
        <div className="space-y-6">
            <BatchMarksClient
                students={studentsWithMarks}
                subjects={semesterSubjects}
                batch={batch}
            />
        </div>
    );
}



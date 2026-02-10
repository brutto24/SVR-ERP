"use client";

import { useState } from "react";
import { Users, CheckSquare, FileText, Search, Download, Settings, Pencil } from "lucide-react";
import { StudentDetailsModal } from "@/components/admin/StudentDetailsModal";
import StudentManager from "@/components/admin/StudentManager"; // Import StudentManager
import MarksEntryModal from "@/components/admin/MarksEntryModal";

type Student = {
    id: string;
    registerNumber: string;
    name: string;
    email: string; // This is top level here
    profilePicture: string | null;
    status: string;
    currentSemester: string;
    cgpa: string | null;
    attendancePercentage: number | null;
    totalClasses?: number;
    presentClasses?: number;
    absentClasses?: number;
    mobileNumber?: string | null;
    parentName?: string | null;
    parentMobile?: string | null;
    address?: string | null;
    aadharNumber?: string | null;
    apaarId?: string | null;
};

type Subject = {
    id: string;
    name: string;
    code: string;
    semester: string;
    credits: number;
    type: string;
    // ...
};

export default function MyClassClient({
    students,
    batchName,
    className,
    allSubjects,
    attendanceData,
    marksData,
    canEdit,
    batchId,
    classId
}: {
    students: Student[];
    batchName: string;
    className: string;
    allSubjects: Subject[];
    attendanceData: Record<string, Record<string, { total: number; present: number; absent: number; percentage: number }>>;
    marksData: Record<string, Record<string, Record<string, number>>>;
    canEdit?: boolean;
    batchId?: string;
    classId?: string;
}) {
    const [activeTab, setActiveTab] = useState<"students" | "attendance" | "marks" | "manage">("students");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    // Semester States
    const [selectedAttendanceSemester, setSelectedAttendanceSemester] = useState("1-1");
    const [selectedMarksSemester, setSelectedMarksSemester] = useState("1-1");
    const [selectedExamType, setSelectedExamType] = useState<"mid1" | "mid2" | "semester" | "lab_internal" | "lab_external">("mid1");

    // Edit Marks State
    const [editingMarksStudent, setEditingMarksStudent] = useState<Student | null>(null);

    // Derived Data
    const currentMarksSubjects = allSubjects.filter(s => s.semester === selectedMarksSemester);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Map students for StudentManager if needed (StudentManager expects user object for name/email sometimes, but handles top level too)
    // We'll pass them as is, StudentManager uses `stu.user?.name || stu.name`
    // But StudentManager expects `user` object for email in `StudentData` type if it uses it.
    // Let's ensure compatibility.
    const studentManagerData = students.map(s => ({
        ...s,
        userId: s.id, // Hack or is it real userId? s.id is student.id. student.userId is different.
        // Actually StudentManager uses `stu.id` for updates.
        // And fetches data.
        user: { name: s.name, email: s.email }
    }));


    // Export Helpers
    const downloadCSV = (headers: string[], data: string[][], filename: string) => {
        const csvContent = [
            headers.join(","),
            ...data.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportAttendance = () => {
        const headers = ["Register No", "Student Name", "Total Classes", "Present", "Absent", "Percentage", "Status"];
        const data = students.map(s => {
            const totalClasses = 120; // Mock consistent with UI
            const percentage = s.attendancePercentage || 0;
            const present = Math.round((percentage / 100) * totalClasses);
            const absent = totalClasses - present;
            const status = percentage >= 75 ? "Regular" : "Shortage";

            return [
                s.registerNumber,
                `"${s.name}"`, // Quote name to handle commas
                totalClasses.toString(),
                present.toString(),
                absent.toString(),
                `${percentage}%`,
                status
            ];
        });

        downloadCSV(headers, data, `${batchName}-${className}-Attendance.csv`);
    };

    const handleExportMarks = () => {
        const headers = ["Register No", "Student Name", ...currentMarksSubjects.map(s => s.code), "Total", "Percentage"];
        const data = students.map(s => {
            let totalObtained = 0;
            let maxTotal = 0;

            const subjectMarks = currentMarksSubjects.map(sub => {
                const mark = marksData[s.id]?.[sub.id]?.[selectedExamType] || 0;
                totalObtained += mark;
                maxTotal += 100; // Assuming 100 per subject for now
                return mark.toString();
            });

            const percentage = maxTotal > 0 ? Math.round((totalObtained / maxTotal) * 100) : 0;

            const row = [
                s.registerNumber,
                `"${s.name}"`,
                ...subjectMarks,
                totalObtained.toString(),
                `${percentage}%`
            ];
            return row;
        });

        downloadCSV(headers, data, `${batchName}-${className}-Marks-${selectedMarksSemester}-${selectedExamType}.csv`);
    };

    const handleExportStudentData = () => {
        const headers = [
            "Student ID", "Student Name", "Mobile Number",
            "Parent Name", "Parent Mobile", "Address",
            "Aadhar Number", "APAAR ID", "Current Semester", "CGPA"
        ];

        const data = students.map(s => [
            s.registerNumber,
            `"${s.name}"`,
            s.mobileNumber || "",
            s.parentName || "",
            s.parentMobile || "",
            `"${s.address || ""}"`,
            s.aadharNumber || "",
            s.apaarId || "",
            s.currentSemester,
            s.cgpa || ""
        ]);

        downloadCSV(headers, data, `${batchName}-${className}-StudentDetails.csv`);
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Class - {className} ({batchName})</h1>
                    <p className="text-gray-500 text-sm">Manage students, attendance, and performance for your assigned class.</p>
                </div>
                <div className="flex gap-2">
                    {/* Add any global actions here, e.g. Sync Data */}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab("students")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                            ${activeTab === "students"
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
                    >
                        <Users className="w-4 h-4" />
                        Students ({students.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("attendance")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                            ${activeTab === "attendance"
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
                    >
                        <CheckSquare className="w-4 h-4" />
                        Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab("marks")}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                            ${activeTab === "marks"
                                ? "border-indigo-500 text-indigo-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
                    >
                        <FileText className="w-4 h-4" />
                        Marks
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => setActiveTab("manage")}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                                ${activeTab === "manage"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }
                            `}
                        >
                            <Settings className="w-4 h-4" />
                            Manage Students
                        </button>
                    )}
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === "students" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                            <div className="relative max-w-sm flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Search students..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleExportStudentData}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all hover:shadow-md whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                Export Data
                            </button>
                        </div>

                        {/* Student List Table */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border-collapse border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                Student ID
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                Student Name
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                Student Mobile
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                Parent Name
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                Parent Mobile
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                Address
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                Aadhar Number
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                APAAR ID
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => {
                                                return (
                                                    <tr
                                                        key={student.id}
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="hover:bg-blue-50 transition-colors cursor-pointer text-sm"
                                                    >
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-900 border border-gray-300 font-mono">
                                                            {student.registerNumber}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-900 border border-gray-300 font-medium">
                                                            {student.name}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                            {student.mobileNumber || "-"}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                            {student.parentName || "-"}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                            {student.parentMobile || "-"}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300 max-w-xs truncate" title={student.address || ""}>
                                                            {student.address || "-"}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300 font-mono">
                                                            {student.aadharNumber || "-"}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300 font-mono">
                                                            {student.apaarId || "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-12 text-center text-gray-400 italic">
                                                    No students found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "attendance" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex gap-2 mb-4">
                            <select
                                value={selectedAttendanceSemester}
                                onChange={(e) => setSelectedAttendanceSemester(e.target.value)}
                                className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            >
                                <option value="1-1">Semester 1-1</option>
                                <option value="1-2">Semester 1-2</option>
                                <option value="2-1">Semester 2-1</option>
                                <option value="2-2">Semester 2-2</option>
                                <option value="3-1">Semester 3-1</option>
                                <option value="3-2">Semester 3-2</option>
                                <option value="4-1">Semester 4-1</option>
                                <option value="4-2">Semester 4-2</option>
                            </select>
                            <button
                                onClick={handleExportAttendance}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all hover:shadow-md"
                            >
                                <Download className="w-4 h-4" />
                                Export Report
                            </button>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {students.map((student) => {
                                        const stats = attendanceData[student.id]?.[selectedAttendanceSemester] || { total: 0, present: 0, absent: 0, percentage: 0 };
                                        const totalClasses = stats.total;
                                        const percentage = stats.percentage;
                                        const present = stats.present;
                                        const absent = stats.absent;

                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-500">{student.registerNumber}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{totalClasses}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{present}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{absent}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`text-sm font-bold ${percentage >= 75 ? 'text-green-600' : percentage >= 65 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                            {percentage}%
                                                        </span>
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full ml-2 overflow-hidden">
                                                            <div className={`h-full ${percentage >= 75 ? 'bg-green-500' : percentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {percentage < 75 && (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                            Shortage
                                                        </span>
                                                    )}
                                                    {percentage >= 75 && (
                                                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            Regular
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "marks" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex gap-2 mb-4">
                            <select
                                value={selectedMarksSemester}
                                onChange={(e) => setSelectedMarksSemester(e.target.value)}
                                className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            >
                                <option value="1-1">Semester 1-1</option>
                                <option value="1-2">Semester 1-2</option>
                                <option value="2-1">Semester 2-1</option>
                                <option value="2-2">Semester 2-2</option>
                                <option value="3-1">Semester 3-1</option>
                                <option value="3-2">Semester 3-2</option>
                                <option value="4-1">Semester 4-1</option>
                                <option value="4-2">Semester 4-2</option>
                            </select>
                            <select
                                value={selectedExamType}
                                onChange={(e) => setSelectedExamType(e.target.value as any)}
                                className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                            >
                                <option value="mid1">Mid-Term 1</option>
                                <option value="mid2">Mid-Term 2</option>
                                <option value="semester">Semester End</option>
                                <option value="lab_internal">Lab Internal</option>
                                <option value="lab_external">Lab External</option>
                            </select>
                            <button
                                onClick={handleExportMarks}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all hover:shadow-md"
                            >
                                <Download className="w-4 h-4" />
                                export Marks
                            </button>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                                                Student
                                            </th>
                                            {currentMarksSubjects.map(subject => (
                                                <th key={subject.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                    {subject.name}
                                                </th>
                                            ))}
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Percentage
                                            </th>
                                            {canEdit && (
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student) => {
                                            let totalObtained = 0;

                                            return (
                                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100">
                                                        <div className="font-medium text-gray-900">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.registerNumber}</div>
                                                    </td>
                                                    {currentMarksSubjects.map(subject => {
                                                        const mark = marksData[student.id]?.[subject.id]?.[selectedExamType];
                                                        if (mark !== undefined) totalObtained += mark;

                                                        return (
                                                            <td key={subject.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                {mark !== undefined ? mark : "-"}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        {totalObtained}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    </td>
                                                    {canEdit && (
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => setEditingMarksStudent(student)}
                                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
                                                                title="Edit Marks"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "manage" && canEdit && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <StudentManager
                            students={studentManagerData}
                            batchId={batchId}
                            classId={classId}
                            canEdit={true}
                        />
                    </div>
                )}
            </div>

            {/* Student Info Modal */}
            <StudentDetailsModal
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                student={selectedStudent ? {
                    ...selectedStudent,
                    mobileNumber: selectedStudent.mobileNumber || undefined,
                    parentName: selectedStudent.parentName || undefined,
                    parentMobile: selectedStudent.parentMobile || undefined,
                    address: selectedStudent.address || undefined,
                    aadharNumber: selectedStudent.aadharNumber || undefined,
                    apaarId: selectedStudent.apaarId || undefined,
                    isActive: selectedStudent.status === 'active',
                    cgpa: selectedStudent.cgpa || undefined,
                    attendancePercentage: selectedStudent.attendancePercentage || undefined
                } : null}
            />
            {/* Marks Edit Modal */}
            {canEdit && (
                <MarksEntryModal
                    isOpen={!!editingMarksStudent}
                    onClose={() => setEditingMarksStudent(null)}
                    student={editingMarksStudent}
                    subjects={currentMarksSubjects}
                    examType={selectedExamType}
                    existingMarks={(() => {
                        if (!editingMarksStudent) return {};
                        const marks: Record<string, number> = {};
                        currentMarksSubjects.forEach(sub => {
                            const m = marksData[editingMarksStudent.id]?.[sub.id]?.[selectedExamType];
                            if (m !== undefined) marks[sub.id] = m;
                        });
                        return marks;
                    })()}
                    onSuccess={() => {
                        // Refresh data (handled by parent props mainly, but we can trigger a router refresh if needed)
                        // Since this is a client component receiving props, we might need to force refresh
                        window.location.reload(); // Simplest way to fetch new props server-side
                    }}
                />
            )}
        </div>
    );
}

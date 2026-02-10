"use client";

import { useState } from "react";
import { Users, CheckSquare, FileText, Search, Download, X } from "lucide-react";

type Student = {
    id: string;
    registerNumber: string;
    name: string;
    email: string;
    profilePicture: string | null;
    status: string;
    currentSemester: string;
    cgpa: string | null;
    attendancePercentage: number | null;
};

type Subject = {
    id: string;
    name: string;
    code: string;
    semester: string;
    credits: number;
    type: string;
};

export default function MyClassClient({
    students,
    batchName,
    className,
    subjects
}: {
    students: Student[];
    batchName: string;
    className: string;
    subjects: Subject[];
}) {
    const [activeTab, setActiveTab] = useState<"students" | "attendance" | "marks">("students");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registerNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        const headers = ["Register No", "Student Name", ...subjects.map(s => s.code), "Total", "Percentage"];
        const data = students.map(s => {
            // Mock logic consistent with UI
            const mockTotal = Math.floor(Math.random() * (subjects.length * 100));
            const mockPercentage = Math.round((mockTotal / (subjects.length * 100)) * 100);

            const row = [
                s.registerNumber,
                `"${s.name}"`,
                ...subjects.map(() => Math.floor(Math.random() * 40 + 60).toString()),
                mockTotal.toString(),
                `${mockPercentage}%`
            ];
            return row;
        });

        downloadCSV(headers, data, `${batchName}-${className}-Marks.csv`);
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
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === "students" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Search Bar */}
                        <div className="relative max-w-sm">
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

                        {/* Student List Table */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Student
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Register No
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Semester
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Attendance
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                CGPA
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    onClick={() => setSelectedStudent(student)}
                                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                                <div className="text-xs text-gray-500">{student.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                        {student.registerNumber}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {student.currentSemester}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                                                <div
                                                                    className={`h-2 rounded-full ${(student.attendancePercentage || 0) >= 75 ? 'bg-green-500' :
                                                                        (student.attendancePercentage || 0) >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${student.attendancePercentage || 0}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-sm text-gray-600">{student.attendancePercentage || 0}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                                        {student.cgpa || "N/A"}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' :
                                                            student.status === 'passed' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
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
                            <select className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                                <option value="semester">Current Semester</option>
                                <option value="month">Current Month (September)</option>
                                <option value="last-month">Last Month (August)</option>
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
                                        // Mocking detailed stats from percentage for now
                                        const totalClasses = 120;
                                        const percentage = student.attendancePercentage || 0;
                                        const present = Math.round((percentage / 100) * totalClasses);
                                        const absent = totalClasses - present;

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
                            <select className="px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm">
                                <option value="mid1">Mid-Term 1</option>
                                <option value="mid2">Mid-Term 2</option>
                                <option value="semester">Semester End</option>
                            </select>
                            <button
                                onClick={handleExportMarks}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all hover:shadow-md"
                            >
                                <Download className="w-4 h-4" />
                                Export Marks
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
                                            {subjects.map(subject => (
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
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.map((student) => {
                                            // Mocking marks logic for visualization
                                            // In real app, we would map over a 'marks' object passed to the component
                                            const mockTotal = Math.floor(Math.random() * (subjects.length * 100)); // Mock
                                            const mockPercentage = Math.round((mockTotal / (subjects.length * 100)) * 100);

                                            return (
                                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10 border-r border-gray-100">
                                                        <div className="font-medium text-gray-900">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.registerNumber}</div>
                                                    </td>
                                                    {subjects.map(subject => (
                                                        <td key={subject.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                            {/* Placeholder for actual mark */}
                                                            {Math.floor(Math.random() * 40 + 60)}
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                        {mockTotal}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${mockPercentage >= 75 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {mockPercentage}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Student Info Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">Student Details</h3>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold mb-3 border-4 border-white shadow-sm">
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h4>
                                <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                                <span className={`mt-2 px-3 py-1 text-xs font-semibold rounded-full ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-700' :
                                    selectedStudent.status === 'passed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                    {selectedStudent.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Register No</div>
                                    <div className="font-mono font-medium text-gray-900">{selectedStudent.registerNumber}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Semester</div>
                                    <div className="font-medium text-gray-900">{selectedStudent.currentSemester}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Attendance</div>
                                    <div className={`font-bold ${(selectedStudent.attendancePercentage || 0) >= 75 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {selectedStudent.attendancePercentage || 0}%
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">CGPA</div>
                                    <div className="font-bold text-gray-900">{selectedStudent.cgpa || "N/A"}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

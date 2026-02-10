"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, User, UserX, Calendar, Filter } from "lucide-react";
import AttendanceExportButton from "@/components/admin/AttendanceExportButton";

interface StudentAttendance {
    id: string;
    name: string;
    registerNumber: string;
    className: string;
    profilePicture: string | null;
    stats: {
        total: number;
        present: number;
    };
    percentage: number;
}

interface Batch {
    name: string;
    startDate: Date;
    endDate: Date;
}

export default function BatchAttendanceClient({
    students,
    batch
}: {
    students: StudentAttendance[],
    batch: Batch
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("all");
    const [showDefaulters, setShowDefaulters] = useState(false);

    // Time Filter State
    const currentView = searchParams.get("view") || "month"; // Default to month
    const currentMonth = searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM

    // Calculate current semester based on batch start date
    const calculateCurrentSemester = () => {
        const startDate = new Date(batch.startDate);
        const today = new Date();

        // Difference in months
        const monthsDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth());

        // Calculate semester index (1-based), assuming 6 months per semester
        // Semester 1: 0-5 months, Semester 2: 6-11 months, etc.
        let semesterIndex = Math.floor(monthsDiff / 6) + 1;

        // Clamp between 1 and 8 (4 years * 2 semesters)
        semesterIndex = Math.max(1, Math.min(8, semesterIndex));

        const year = Math.ceil(semesterIndex / 2);
        const sem = semesterIndex % 2 === 0 ? 2 : 1;

        return `${year}-${sem}`;
    };

    const currentSemester = searchParams.get("semester") || calculateCurrentSemester();

    // Redirect to default view if missing
    useEffect(() => {
        if (!searchParams.get("view")) {
            const params = new URLSearchParams(searchParams);
            params.set("view", "month");
            params.set("month", new Date().toISOString().slice(0, 7));
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, pathname, router]);

    const handleViewChange = (view: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("view", view);
        if (view === "month" && !params.get("month")) {
            params.set("month", new Date().toISOString().slice(0, 7));
        }
        if (view === "semester" && !params.get("semester")) {
            params.set("semester", calculateCurrentSemester());
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleMonthChange = (month: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("month", month);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSemesterChange = (semester: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("semester", semester);
        router.push(`${pathname}?${params.toString()}`);
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.registerNumber.toLowerCase().includes(search.toLowerCase());

            const matchesClass = selectedClass === "all" || student.className === selectedClass;

            const matchesDefaulter = showDefaulters ? student.percentage < 75 : true;

            return matchesSearch && matchesClass && matchesDefaulter;
        });
    }, [students, search, selectedClass, showDefaulters]);

    const uniqueClasses = Array.from(new Set(students.map(s => s.className))).sort();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/attendance" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{batch.name} Attendance</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {students.length} Students • {new Date(batch.startDate).getFullYear()}-{new Date(batch.endDate).getFullYear()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <AttendanceExportButton students={filteredStudents} batchName={batch.name} />
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                {/* Top Row: Time Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">View By:</span>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => handleViewChange("month")}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${currentView === "month" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                Month-wise
                            </button>
                        </div>

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        <button
                            onClick={() => handleViewChange("semester")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${currentView === "semester" ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                        >
                            Semester-wise
                        </button>
                    </div>

                    {currentView === "month" && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <span className="text-sm text-gray-500">Select Month:</span>
                            <input
                                type="month"
                                value={currentMonth}
                                onChange={(e) => handleMonthChange(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    )}

                    {currentView === "semester" && (
                        <div className="flex items-center gap-2 animate-fade-in">
                            <span className="text-sm text-gray-500">Select Semester:</span>
                            <select
                                value={currentSemester}
                                onChange={(e) => handleSemesterChange(e.target.value)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="1-1">1-1</option>
                                <option value="1-2">1-2</option>
                                <option value="2-1">2-1</option>
                                <option value="2-2">2-2</option>
                                <option value="3-1">3-1</option>
                                <option value="3-2">3-2</option>
                                <option value="4-1">4-1</option>
                                <option value="4-2">4-2</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Bottom Row: Search & Class Filters */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search student by name or register no..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                        />
                    </div>

                    <div className="flex gap-4 w-full lg:w-auto overflow-x-auto items-center">
                        {/* Defaulter Toggle Button */}
                        <button
                            onClick={() => setShowDefaulters(!showDefaulters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                            ${showDefaulters
                                    ? "bg-red-50 text-red-600 border border-red-200 shadow-sm"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                }
                        `}
                        >
                            <UserX className="w-4 h-4" />
                            {showDefaulters ? "Showing Defaulters (<75%)" : "Show Defaulters Only"}
                        </button>

                        <div className="h-8 w-px bg-gray-200 hidden lg:block"></div>

                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-700 outline-none focus:border-indigo-500 min-w-[150px]"
                        >
                            <option value="all">All Classes</option>
                            {uniqueClasses.map(cls => (
                                <option key={cls} value={cls}>Class {cls}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Register No</th>
                                <th className="px-6 py-4">Class</th>
                                <th className="px-6 py-4 text-center">Classes Attended</th>
                                <th className="px-6 py-4 text-center">Percentage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{student.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{student.registerNumber}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                {student.className}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600">
                                            <span className="font-medium text-gray-900">{student.stats.present}</span>
                                            <span className="text-gray-400 mx-1">/</span>
                                            {student.stats.total}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-lg font-bold ${student.percentage >= 75 ? "text-green-600" :
                                                    student.percentage >= 65 ? "text-yellow-600" : "text-red-600"
                                                    }`}>
                                                    {student.percentage}%
                                                </span>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${student.percentage >= 75 ? "bg-green-500" :
                                                            student.percentage >= 65 ? "bg-yellow-500" : "bg-red-500"
                                                            }`}
                                                        style={{ width: `${student.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer Stats */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-gray-50/50">
                    <span>Showing {filteredStudents.length} of {students.length} students</span>
                </div>
            </div>
        </div>
    );
}

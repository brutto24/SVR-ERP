"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Download, Filter, Pencil, Save } from "lucide-react";
import StudentMarksDetailModal from "@/components/admin/StudentMarksDetailModal";
import MarksEntryModal from "@/components/admin/MarksEntryModal";

interface StudentMarks {
    id: string;
    name: string;
    registerNumber: string;
    className: string;
    marks: Record<string, any>; // subjectId -> mark details
    detailedMarks: Record<string, any>; // subjectId -> detailed breakdown
    sgpa: string; // Current or calculated
    cgpa: string;
}

interface Subject {
    id: string;
    name: string;
    code: string;
    credits: number;
    type: "theory" | "lab";
}

interface Batch {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
}

export default function BatchMarksClient({
    students,
    subjects,
    batch
}: {
    students: StudentMarks[],
    subjects: Subject[],
    batch: Batch
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState("");
    const [selectedClass, setSelectedClass] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState<{
        id: string;
        name: string;
        registerNumber: string;
        className: string;
        cgpa: string;
        sgpa: string;
        subjects: any[];
    } | null>(null);

    const [editingStudent, setEditingStudent] = useState<{
        id: string;
        name: string;
        registerNumber: string;
    } | null>(null);

    const [selectedExamType, setSelectedExamType] = useState<"mid1" | "mid2" | "semester" | "lab_internal" | "lab_external">("mid1");

    // Semester Logic
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

    const currentSemester = searchParams.get("semester") || calculateCurrentSemester();

    useEffect(() => {
        if (!searchParams.get("semester")) {
            const params = new URLSearchParams(searchParams);
            params.set("semester", calculateCurrentSemester());
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [searchParams, pathname, router]);

    const handleSemesterChange = (semester: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("semester", semester);
        router.push(`${pathname}?${params.toString()}`);
    };

    // Filter Logic
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.registerNumber.toLowerCase().includes(search.toLowerCase());
            const matchesClass = selectedClass === "all" || student.className === selectedClass;
            return matchesSearch && matchesClass;
        });
    }, [students, search, selectedClass]);

    const uniqueClasses = Array.from(new Set(students.map(s => s.className))).sort();

    // Export Logic
    const handleExport = () => {
        const headers = [
            "Register No", "Name", "Class",
            ...subjects.map(s => `${s.code} - ${s.name}`),
            "SGPA", "CGPA"
        ];

        const data = filteredStudents.map(student => {
            const subjectMarks = subjects.map(sub => {
                const mark = student.marks[sub.id];
                // Return total or 'AB' or '-'
                if (!mark) return "-";
                return mark.total.toString();
            });

            return [
                student.registerNumber,
                `"${student.name}"`,
                student.className,
                ...subjectMarks,
                student.sgpa || "0.0",
                student.cgpa || "0.0"
            ];
        });

        const csvContent = [
            headers.join(","),
            ...data.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${batch.name}_${currentSemester}_Marks.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // View Student Details
    const handleViewDetails = (student: StudentMarks) => {
        // Transform data for modal
        const subjectsWithMarks = subjects.map(sub => ({
            id: sub.id,
            name: sub.name,
            code: sub.code,
            type: sub.type,
            credits: sub.credits,
            marks: student.detailedMarks[sub.id] || {
                internal: 0,
                external: 0,
                total: 0,
                grade: 'F'
            }
        }));

        setSelectedStudent({
            id: student.id,
            name: student.name,
            registerNumber: student.registerNumber,
            className: student.className,
            cgpa: student.cgpa,
            sgpa: student.sgpa,
            subjects: subjectsWithMarks
        });
    };

    const handleEditMarks = (student: StudentMarks) => {
        setEditingStudent({
            id: student.id,
            name: student.name,
            registerNumber: student.registerNumber
        });
    };

    const getExistingMarksForEdit = () => {
        if (!editingStudent) return {};
        const student = students.find(s => s.id === editingStudent.id);
        if (!student) return {};

        const marks: Record<string, number> = {};
        subjects.forEach(sub => {
            // Access detailed marks if available, otherwise fallback/default
            // detailedMarks structure: [subjectId]: { mid1: ..., mid2: ..., ... }
            const subjectMarks = student.detailedMarks[sub.id];
            if (subjectMarks && subjectMarks[selectedExamType] !== undefined) {
                marks[sub.id] = subjectMarks[selectedExamType];
            }
        });
        return marks;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Student Details Modal */}
            <StudentMarksDetailModal
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                student={selectedStudent}
            />

            <MarksEntryModal
                isOpen={!!editingStudent}
                onClose={() => setEditingStudent(null)}
                student={editingStudent}
                subjects={subjects}
                examType={selectedExamType}
                existingMarks={getExistingMarksForEdit()}
                onSuccess={() => {
                    // Ideally re-fetch or rely on Next.js server verification
                    router.refresh();
                }}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/marks" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{batch.name} Marks</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {students.length} Students • Semester {currentSemester}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Semester:</span>
                        <select
                            value={currentSemester}
                            onChange={(e) => handleSemesterChange(e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                        >
                            {["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"].map(sem => (
                                <option key={sem} value={sem}>{sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Exam:</span>
                        <select
                            value={selectedExamType}
                            onChange={(e) => setSelectedExamType(e.target.value as any)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-indigo-500 outline-none bg-white"
                        >
                            <option value="mid1">Mid-Term 1</option>
                            <option value="mid2">Mid-Term 2</option>
                            <option value="semester">Semester End</option>
                            <option value="lab_internal">Lab Internal</option>
                            <option value="lab_external">Lab External</option>
                        </select>
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-2 hidden md:block"></div>

                    <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-indigo-500 outline-none bg-white w-full md:w-auto"
                    >
                        <option value="all">All Classes</option>
                        {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                    </select>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 border-r border-gray-200 min-w-[120px] sticky left-0 bg-gray-50 z-10">Register No</th>
                                <th className="px-4 py-3 border-r border-gray-200 min-w-[180px] sticky left-[120px] bg-gray-50 z-10">Name</th>
                                <th className="px-4 py-3 border-r border-gray-200 w-20">Class</th>
                                {subjects.map(sub => (
                                    <th key={sub.id} className="px-4 py-3 border-r border-gray-200 text-center min-w-[100px]" title={sub.name}>
                                        {sub.code}
                                        <div className="text-[10px] font-normal text-gray-500 mt-0.5 truncate max-w-[100px] mx-auto">{sub.name}</div>
                                    </th>
                                ))}
                                <th className="px-4 py-3 border-r border-gray-200 text-center w-20">SGPA</th>
                                <th className="px-4 py-3 border-r border-gray-200 text-center w-20">CGPA</th>
                                <th className="px-4 py-3 text-center w-24 sticky right-0 bg-gray-50 z-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-4 py-3 border-r border-gray-100 font-mono text-gray-600 sticky left-0 bg-white group-hover:bg-indigo-50/30">{student.registerNumber}</td>
                                        <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900 sticky left-[120px] bg-white group-hover:bg-indigo-50/30">{student.name}</td>
                                        <td className="px-4 py-3 border-r border-gray-100 text-gray-600 text-center">{student.className}</td>
                                        {subjects.map(sub => {
                                            const mark = student.marks[sub.id];
                                            return (
                                                <td key={sub.id} className="px-4 py-3 border-r border-gray-100 text-center">
                                                    {mark ? (
                                                        <span className={`font-medium ${mark.grade === 'F' ? 'text-red-600' : 'text-gray-800'}`}>
                                                            {mark.total}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-800">{student.sgpa || "-"}</td>
                                        <td className="px-4 py-3 border-r border-gray-100 text-center font-bold text-gray-800">{student.cgpa || "-"}</td>
                                        <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-indigo-50/30">
                                            <button
                                                onClick={() => handleEditMarks(student)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                title="Edit Marks"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={subjects.length + 5} className="px-6 py-12 text-center text-gray-500">
                                        No students found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

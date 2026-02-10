"use client";

import { useState, useEffect } from "react";
import { getStudentsForClass, markAttendance } from "@/actions/faculty";
import { Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

// Define prop types matching the page's data
type AssignedMeta = {
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    semester: string;
};

export default function AttendanceClient({
    facultyId,
    assignments
}: {
    facultyId: string;
    assignments: AssignedMeta[];
}) {
    const router = useRouter();

    // State
    const [selectedSem, setSelectedSem] = useState<string>("");
    const [selectedAssignment, setSelectedAssignment] = useState<string>("");
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [period, setPeriod] = useState<string>("");

    const [students, setStudents] = useState<any[]>([]);
    const [attendanceCtx, setAttendanceCtx] = useState<Record<string, boolean>>({});

    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<{
        success: boolean;
        total: number;
        present: number;
        absent: number;
        absentStudents: { name: string; registerNumber: string }[];
    } | null>(null);
    const [step, setStep] = useState(1);

    // Derived
    const currentAssignment = assignments.find(a => `${a.subjectId}-${a.classId}` === selectedAssignment);

    // Filter Logic
    const availableSemesters = Array.from(new Set(assignments.map(a => a.semester))).sort();
    const filteredAssignments = selectedSem
        ? assignments.filter(a => a.semester === selectedSem)
        : assignments;

    // Fetch students when assignment is selected
    const handleLoadStudents = async () => {
        if (!selectedAssignment || !date || !period) {
            alert("Please select Class/Subject, Date, and Period.");
            return;
        }

        setIsLoading(true);
        try {
            const assignment = assignments.find(a => `${a.subjectId}-${a.classId}` === selectedAssignment);
            if (!assignment) return;

            const list = await getStudentsForClass(assignment.classId);
            setStudents(list || []);

            // Initialize all as Present
            const initial: Record<string, boolean> = {};
            list.forEach((s: any) => initial[s.id] = true);
            setAttendanceCtx(initial);

            setStep(2);
        } catch (error) {
            console.error(error);
            alert("Failed to load students.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAttendance = (studentId: string) => {
        setAttendanceCtx(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
    };

    const handleSubmit = async () => {
        if (!currentAssignment || !date || !period) return;

        setIsSubmitting(true);
        try {
            // Prepare Payload
            const payload = students.map(s => ({
                studentId: s.id,
                subjectId: currentAssignment.subjectId,
                date: new Date(date),
                period: parseInt(period),
                isPresent: !!attendanceCtx[s.id]
            }));

            const res = await markAttendance(facultyId, payload);

            if (res.success) {
                // Calculate Stats for Summary
                const total = students.length;
                const absentList = students.filter(s => !attendanceCtx[s.id]);
                const presentCount = total - absentList.length;

                setSubmissionResult({
                    success: true,
                    total,
                    present: presentCount,
                    absent: absentList.length,
                    absentStudents: absentList.map(s => ({
                        name: s.name,
                        registerNumber: s.registerNumber
                    }))
                });

                router.refresh();
            } else {
                alert("Failed: " + res.error);
            }

        } catch (error) {
            console.error(error);
            alert("An error occurred while submitting attendance.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-indigo-600">
                    Mark Attendance
                </h1>
                <p className="text-gray-500 text-sm">Select details to load student list</p>
            </div>

            {/* SELECTION PANEL */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Semester Filter */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Semester</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedSem}
                            onChange={(e) => {
                                setSelectedSem(e.target.value);
                                setSelectedAssignment(""); // Reset subject
                                setStep(1);
                            }}
                        >
                            <option value="">All Semesters</option>
                            {availableSemesters.map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Class & Subject</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedAssignment}
                            onChange={(e) => {
                                setSelectedAssignment(e.target.value);
                                setStep(1); // Reset if changed
                            }}
                        >
                            <option value="">-- Select --</option>
                            {filteredAssignments.map(a => (
                                <option key={`${a.subjectId}-${a.classId}`} value={`${a.subjectId}-${a.classId}`}>
                                    {a.className} - {a.subjectName} ({a.semester})
                                </option>
                            ))}
                        </select>
                        {filteredAssignments.length === 0 && <p className="text-xs text-red-400 mt-1">No subjects found for this semester.</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Period</label>
                        <select
                            className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                        >
                            <option value="">Select</option>
                            {[1, 2, 3, 4, 5, 6, 7].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleLoadStudents}
                        disabled={isLoading || !selectedAssignment || !period}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isLoading ? "Loading..." : "Load Students"}
                    </button>
                </div>
            </div>

            {/* STUDENT LIST */}
            {step === 2 && students.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Student List: {currentAssignment?.className}</h3>
                        <div className="flex gap-4 text-sm font-medium">
                            <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                Present: {Object.values(attendanceCtx).filter(Boolean).length}
                            </span>
                            <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full">
                                Absent: {Object.values(attendanceCtx).filter(v => !v).length}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-scroll pr-2">
                        {students.map(student => {
                            const isPresent = attendanceCtx[student.id];
                            return (
                                <div
                                    key={student.id}
                                    onClick={() => toggleAttendance(student.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${isPresent
                                        ? 'bg-white border-gray-200 hover:border-indigo-300'
                                        : 'bg-red-50 border-red-200 shadow-sm'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors ${isPresent ? 'bg-gray-200 text-gray-500' : 'bg-red-500'}`}>
                                        {isPresent ? 'P' : 'A'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className={`text-sm font-semibold truncate ${isPresent ? 'text-gray-700' : 'text-red-700'}`}>{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.registerNumber}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                            Submit Attendance
                        </button>
                    </div>
                </div>
            )}
            {/* SUCCESS SUMMARY MODAL */}
            {submissionResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4 relative">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Attendance Submitted!</h3>
                            <p className="text-gray-500 text-sm mt-1">Class: {currentAssignment?.className}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                                <p className="text-xs font-bold text-green-600 uppercase">Present</p>
                                <p className="text-2xl font-bold text-green-700">{submissionResult.present}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                                <p className="text-xs font-bold text-red-600 uppercase">Absent</p>
                                <p className="text-2xl font-bold text-red-700">{submissionResult.absent}</p>
                            </div>
                        </div>

                        {submissionResult.absent > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Absent Students</p>
                                <ul className="space-y-1">
                                    {submissionResult.absentStudents.map((stu, i) => (
                                        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                            <span className="font-medium">{stu.name}</span>
                                            <span className="text-gray-400 text-xs">({stu.registerNumber})</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setSubmissionResult(null);
                                setStep(1);
                                setAttendanceCtx({});
                                setStudents([]);
                            }}
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

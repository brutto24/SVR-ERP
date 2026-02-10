"use client";

import { useState, useEffect } from 'react';
import { enterMarks, getStudentsForClass, getExistingMarks } from "@/actions/faculty";
import { Loader2, Save, Lock, AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Modal } from "../ui/Modal";

type Assignment = {
    subjectId: string;
    subjectName: string;
    subjectType: "theory" | "lab";
    classId: string;
    className: string;
    semester: string;
};

type ExamType = "mid1" | "mid2" | "semester" | "lab_internal" | "lab_external";

export default function MarksEntryClient({
    facultyId,
    assignments
}: {
    facultyId: string;
    assignments: Assignment[];
}) {
    const router = useRouter();
    const [selectedAssignment, setSelectedAssignment] = useState<string>("");
    const [examType, setExamType] = useState<ExamType>("mid1");
    const [currentSubjectType, setCurrentSubjectType] = useState<"theory" | "lab">("theory");

    // Data State
    const [students, setStudents] = useState<any[]>([]);
    const [marksData, setMarksData] = useState<Record<string, {
        objective: number;
        theory: number;
        assignment: number;
        total: number;
    }>>({});

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Update subject type when assignment changes
    useEffect(() => {
        if (!selectedAssignment) return;

        const assignment = assignments.find(a => `${a.subjectId}-${a.classId}` === selectedAssignment);
        if (!assignment) return;

        // Update subject type and reset exam type to default for that type
        setCurrentSubjectType(assignment.subjectType);
        if (assignment.subjectType === "lab") {
            setExamType("lab_internal");
        } else {
            setExamType("mid1");
        }
    }, [selectedAssignment, assignments]);

    // Fetch data when selection or exam type changes
    useEffect(() => {
        if (!selectedAssignment) {
            setStudents([]);
            setMarksData({});
            return;
        }

        const fetchClassData = async () => {
            setIsLoading(true);
            try {
                const assignment = assignments.find(a => `${a.subjectId}-${a.classId}` === selectedAssignment);
                if (!assignment) return;

                // 1. Get Students
                const studentsList = await getStudentsForClass(assignment.classId);
                setStudents(studentsList || []);

                // 2. Get Existing Marks for current exam type
                const existing = await getExistingMarks(assignment.classId, assignment.subjectId, examType);

                // Transform to map
                const marksMap: any = {};
                let locked = false;

                existing.forEach(m => {
                    marksMap[m.studentId] = {
                        objective: m.objective || 0,
                        theory: m.theory || 0,
                        assignment: m.assignment || 0,
                        total: m.total || 0 // Should match calculation
                    };
                    if (m.isLocked) locked = true;
                });

                setMarksData(marksMap);
                setIsLocked(locked);

            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load class data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassData();
    }, [selectedAssignment, examType, assignments]);

    const handleInputChange = (studentId: string, field: "objective" | "theory" | "assignment", value: string) => {
        const numValue = parseInt(value) || 0; // Handle NaN as 0, or simplistic

        setMarksData(prev => {
            const current = prev[studentId] || { objective: 0, theory: 0, assignment: 0, total: 0 };
            const updated = { ...current, [field]: numValue };

            // Auto Calculate Total
            // Logic: Total = Obj + Theory + Assign (for Mid)
            // Or different for Sem? Keeping it simple additive for now.
            updated.total = (updated.objective || 0) + (updated.theory || 0) + (updated.assignment || 0);

            return { ...prev, [studentId]: updated };
        });
    };

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSaveClick = () => {
        if (!selectedAssignment) return;
        setShowConfirmModal(true);
    };

    const confirmSave = async () => {
        setShowConfirmModal(false);
        setIsSaving(true);
        try {
            const assignment = assignments.find(a => `${a.subjectId}-${a.classId}` === selectedAssignment);
            if (!assignment) return;

            // Prepare payload
            const payload = students.map(s => {
                const m = marksData[s.id] || { objective: 0, theory: 0, assignment: 0, total: 0 };
                return {
                    studentId: s.id,
                    subjectId: assignment.subjectId,
                    type: examType,
                    objective: m.objective,
                    theory: m.theory,
                    assignment: m.assignment,
                    total: m.total
                };
            });

            const res = await enterMarks(facultyId, payload);
            if (res.success) {
                toast.success("Marks saved successfully!");
                setIsLocked(true); // Assuming API locks it
                router.refresh();
            } else {
                toast.error(res.error || "Failed to save marks");
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to save marks");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ... Selection UI ... */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Class & Subject</label>
                    <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={selectedAssignment}
                        onChange={(e) => setSelectedAssignment(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {assignments.map(a => (
                            <option key={`${a.subjectId}-${a.classId}`} value={`${a.subjectId}-${a.classId}`}>
                                {a.subjectName} - {a.className} (Sem {a.semester})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-48">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                    <select
                        className="w-full border rounded-lg px-3 py-2"
                        value={examType}
                        onChange={(e) => setExamType(e.target.value as ExamType)}
                    >
                        {currentSubjectType === "theory" ? (
                            <>
                                <option value="mid1">Mid Exam 1</option>
                                <option value="mid2">Mid Exam 2</option>
                                <option value="semester">Semester End</option>
                            </>
                        ) : (
                            <>
                                <option value="lab_internal">Lab Internal</option>
                                <option value="lab_external">Lab External</option>
                            </>
                        )}
                    </select>
                </div>
            </div>

            {selectedAssignment && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800">Student List</h3>
                        {isLocked ? (
                            <span className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium">
                                <Lock className="w-4 h-4" /> Allowed Read-Only
                            </span>
                        ) : (
                            <button
                                onClick={handleSaveClick}
                                disabled={isSaving || students.length === 0}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 min-w-[100px] justify-center"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Marks
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex justify-center text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (students.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">No students found in this class.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Register No</th>
                                        <th className="px-4 py-3 text-left">Name</th>
                                        {(examType === "mid1" || examType === "mid2") && (
                                            <>
                                                <th className="px-4 py-3 text-center w-24">Objective (10)</th>
                                                <th className="px-4 py-3 text-center w-24">Theory (15)</th>
                                                <th className="px-4 py-3 text-center w-24">Assign (5)</th>
                                                <th className="px-4 py-3 text-center w-24 font-bold">Total (30)</th>
                                            </>
                                        )}
                                        {examType === "semester" && (
                                            <th className="px-4 py-3 text-center w-32 font-bold">Theory (70)</th>
                                        )}
                                        {examType === "lab_internal" && (
                                            <th className="px-4 py-3 text-center w-32 font-bold">Lab Internal (30)</th>
                                        )}
                                        {examType === "lab_external" && (
                                            <th className="px-4 py-3 text-center w-32 font-bold">Lab External (70)</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map(student => {
                                        const marks = marksData[student.id] || { objective: 0, theory: 0, assignment: 0, total: 0 };
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-gray-800">{student.registerNumber}</td>
                                                <td className="px-4 py-3 text-gray-600">{student.name}</td>

                                                {(examType === "mid1" || examType === "mid2") && (
                                                    <>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="number" min="0" max="10"
                                                                value={marks.objective || 0}
                                                                onChange={(e) => handleInputChange(student.id, "objective", e.target.value)}
                                                                disabled={isLocked}
                                                                className="w-16 text-center border rounded py-1 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="number" min="0" max="15"
                                                                value={marks.theory || 0}
                                                                onChange={(e) => handleInputChange(student.id, "theory", e.target.value)}
                                                                disabled={isLocked}
                                                                className="w-16 text-center border rounded py-1 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <input
                                                                type="number" min="0" max="5"
                                                                value={marks.assignment || 0}
                                                                onChange={(e) => handleInputChange(student.id, "assignment", e.target.value)}
                                                                disabled={isLocked}
                                                                className="w-16 text-center border rounded py-1 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-bold text-indigo-700 bg-indigo-50/30">
                                                            {marks.total}
                                                        </td>
                                                    </>
                                                )}

                                                {examType === "semester" && (
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="number" min="0" max="70"
                                                            value={marks.total || 0}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 0;
                                                                setMarksData(prev => ({
                                                                    ...prev,
                                                                    [student.id]: { objective: 0, theory: 0, assignment: 0, total: value }
                                                                }));
                                                            }}
                                                            disabled={isLocked}
                                                            className="w-20 text-center border rounded py-1 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 font-bold"
                                                        />
                                                    </td>
                                                )}

                                                {examType === "lab_internal" && (
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="number" min="0" max="30"
                                                            value={marks.total || 0}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 0;
                                                                setMarksData(prev => ({
                                                                    ...prev,
                                                                    [student.id]: { objective: 0, theory: 0, assignment: 0, total: value }
                                                                }));
                                                            }}
                                                            disabled={isLocked}
                                                            className="w-20 text-center border rounded py-1 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 font-bold"
                                                        />
                                                    </td>
                                                )}

                                                {examType === "lab_external" && (
                                                    <td className="px-4 py-3 text-center">
                                                        <input
                                                            type="number" min="0" max="70"
                                                            value={marks.total || 0}
                                                            onChange={(e) => {
                                                                const value = parseInt(e.target.value) || 0;
                                                                setMarksData(prev => ({
                                                                    ...prev,
                                                                    [student.id]: { objective: 0, theory: 0, assignment: 0, total: value }
                                                                }));
                                                            }}
                                                            disabled={isLocked}
                                                            className="w-20 text-center border rounded py-1 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 font-bold"
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}

            {/* Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title=""
                size="md"
            >
                <div className="flex flex-col items-center text-center -mt-6">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                        <AlertCircle size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Marks Submission</h3>

                    <p className="text-gray-500 mb-8">
                        Are you sure you want to save? Once saved, marks will be locked and cannot be edited.
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmSave}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                        >
                            Confirm Save
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

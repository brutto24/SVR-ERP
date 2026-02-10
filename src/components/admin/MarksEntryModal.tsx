"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { updateMarks } from "@/actions/marks";
import { toast } from "sonner"; // Assuming you have sonner or some toast

interface Subject {
    id: string;
    name: string;
    code: string;
}

interface MarksEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: {
        id: string;
        name: string;
        registerNumber: string;
    } | null;
    subjects: Subject[];
    examType: "mid1" | "mid2" | "semester" | "lab_internal" | "lab_external";
    existingMarks: Record<string, number>; // subjectId -> marks
    onSuccess: () => void;
}

export default function MarksEntryModal({
    isOpen,
    onClose,
    student,
    subjects,
    examType,
    existingMarks,
    onSuccess
}: MarksEntryModalProps) {
    const [marks, setMarks] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && student) {
            // Initialize with existing marks or empty
            const initialMarks: Record<string, string> = {};
            subjects.forEach(sub => {
                initialMarks[sub.id] = existingMarks[sub.id] !== undefined ? existingMarks[sub.id].toString() : "";
            });
            setMarks(initialMarks);
            setError("");
        }
    }, [isOpen, student, subjects, existingMarks]);

    const handleMarkChange = (subjectId: string, value: string) => {
        // Allow only numbers and maybe decimal in future, for now just numbers
        if (value === "" || /^\d*$/.test(value)) {
            // Basic constraint check (e.g. max marks) could go here
            setMarks(prev => ({ ...prev, [subjectId]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!student) return;
        setIsSubmitting(true);
        setError("");

        try {
            const marksToUpdate = Object.entries(marks)
                .filter(([_, value]) => value !== "")
                .map(([subjectId, value]) => ({
                    studentId: student.id,
                    subjectId,
                    type: examType,
                    total: parseInt(value),
                    // We can add distinct theory/objective later if UI splits them
                }));

            if (marksToUpdate.length === 0) {
                setError("No marks entered to save.");
                setIsSubmitting(false);
                return;
            }

            const res = await updateMarks("ADMIN_OR_FACULTY", marksToUpdate); // Pass appropriate user ID context if needed

            if (res.success) {
                toast.success("Marks updated successfully");
                onSuccess();
                onClose();
            } else {
                setError(res.error || "Failed to update marks");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !student) return null;

    const getExamLabel = (type: string) => {
        switch (type) {
            case "mid1": return "Mid-Term 1";
            case "mid2": return "Mid-Term 2";
            case "semester": return "Semester End";
            case "lab_internal": return "Lab Internal";
            case "lab_external": return "Lab External";
            default: return type;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Edit Marks</h3>
                        <p className="text-sm text-gray-500">
                            {student.name} ({student.registerNumber}) • {getExamLabel(examType)}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {subjects.map(subject => (
                            <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors">
                                <div>
                                    <div className="font-medium text-gray-900">{subject.name}</div>
                                    <div className="text-xs text-gray-500">{subject.code}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={marks[subject.id] || ""}
                                        onChange={(e) => handleMarkChange(subject.id, e.target.value)}
                                        placeholder="-"
                                        className="w-20 px-3 py-2 text-center font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                    <span className="text-gray-400 text-xs w-8 text-right">/ 100</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Marks
                    </button>
                </div>
            </div>
        </div>
    );
}

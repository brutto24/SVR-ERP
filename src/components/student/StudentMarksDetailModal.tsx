"use client";

import { X, BookOpen, GraduationCap } from "lucide-react";

interface StudentMarksDetailModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    marks: {
        subject: string;
        internal: number;
        external: number;
        total: number;
        semester: string;
        grade: string;
        credits: number;
        mid1?: number;
        mid2?: number;
        lab_internal?: number;
        assignment?: number;
        semester_external?: number;
        lab_external?: number;
        subjectType?: "theory" | "lab";
    }[];
    profile: {
        name: string;
        registerNumber: string;
        className: string;
        sgpa: string;
        cgpa: string;
    };
}

export default function StudentMarksDetailModal({
    isOpen,
    onCloseAction,
    marks,
    profile
}: StudentMarksDetailModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onCloseAction}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{profile.name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{profile.registerNumber}</span>
                            <span>Class {profile.className}</span>
                        </div>
                    </div>
                    <button
                        onClick={onCloseAction}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* GPA Summary */}
                <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase">SGPA</div>
                            <div className="text-2xl font-bold text-gray-900">{profile.sgpa}</div>
                        </div>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-semibold uppercase">CGPA</div>
                            <div className="text-2xl font-bold text-gray-900">{profile.cgpa}</div>
                        </div>
                    </div>
                </div>

                {/* Subjects List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        {marks.map((subject, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Subject Header */}
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${subject.subjectType === 'lab'
                                                    ? 'bg-purple-100'
                                                    : 'bg-blue-100'
                                                }`}>
                                                <BookOpen className={`w-5 h-5 ${subject.subjectType === 'lab'
                                                        ? 'text-purple-600'
                                                        : 'text-blue-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{subject.subject}</h4>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subject.subjectType === 'lab'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {subject.subjectType?.toUpperCase() || 'THEORY'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{subject.credits} Credits</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 font-semibold uppercase mb-1">Grade</div>
                                            <span className={`inline-block px-3 py-1 rounded-lg text-lg font-bold ${subject.grade === 'F'
                                                    ? 'bg-red-100 text-red-700'
                                                    : subject.grade === 'O'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : subject.grade.startsWith('A')
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {subject.grade}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Marks Breakdown */}
                                <div className="p-6">
                                    {subject.subjectType !== 'lab' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Internal Component */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase">Internal (40)</div>
                                                {subject.mid1 !== undefined && subject.mid1 > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Mid-1</span>
                                                        <span className="font-bold text-gray-900">{subject.mid1}</span>
                                                    </div>
                                                )}
                                                {subject.mid2 !== undefined && subject.mid2 > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Mid-2</span>
                                                        <span className="font-bold text-gray-900">{subject.mid2}</span>
                                                    </div>
                                                )}
                                                {subject.assignment !== undefined && subject.assignment > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Assignment</span>
                                                        <span className="font-bold text-gray-900">{subject.assignment}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center py-2 bg-indigo-50 px-3 rounded-lg mt-2">
                                                    <span className="text-sm font-semibold text-indigo-900">Total Internal</span>
                                                    <span className="font-bold text-indigo-900">{subject.internal}</span>
                                                </div>
                                            </div>

                                            {/* External Component */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase">External (60)</div>
                                                {subject.semester_external !== undefined && subject.semester_external > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Semester Exam</span>
                                                        <span className="font-bold text-gray-900">{subject.semester_external}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center py-2 bg-purple-50 px-3 rounded-lg mt-2">
                                                    <span className="text-sm font-semibold text-purple-900">Total External</span>
                                                    <span className="font-bold text-purple-900">{subject.external}</span>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase">Overall (100)</div>
                                                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 rounded-lg">
                                                    <span className="text-sm font-bold text-gray-900">Total Marks</span>
                                                    <span className="text-2xl font-bold text-gray-900">{subject.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Lab Internal */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase">Lab Internal (40)</div>
                                                {subject.lab_internal !== undefined && subject.lab_internal > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Continuous Evaluation</span>
                                                        <span className="font-bold text-gray-900">{subject.lab_internal}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center py-2 bg-indigo-50 px-3 rounded-lg mt-2">
                                                    <span className="text-sm font-semibold text-indigo-900">Total Internal</span>
                                                    <span className="font-bold text-indigo-900">{subject.internal}</span>
                                                </div>
                                            </div>

                                            {/* Lab External */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase">Lab External (60)</div>
                                                {subject.lab_external !== undefined && subject.lab_external > 0 && (
                                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                        <span className="text-sm text-gray-600">Lab Exam</span>
                                                        <span className="font-bold text-gray-900">{subject.lab_external}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-center py-2 bg-purple-50 px-3 rounded-lg mt-2">
                                                    <span className="text-sm font-semibold text-purple-900">Total External</span>
                                                    <span className="font-bold text-purple-900">{subject.external}</span>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="space-y-3">
                                                <div className="text-xs font-semibold text-gray-500 uppercase">Overall (100)</div>
                                                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-indigo-100 to-purple-100 px-4 rounded-lg">
                                                    <span className="text-sm font-bold text-gray-900">Total Marks</span>
                                                    <span className="text-2xl font-bold text-gray-900">{subject.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {marks.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No marks data available for this semester.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

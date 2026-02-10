"use client";

import { useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { StudentDetailsModal } from '@/components/admin/StudentDetailsModal';

type StudentDashboardProps = {
    student: {
        id: string;
        name: string;
        email: string;
        registerNumber: string;
        currentSemester: string;
        cgpa: string;
        attendancePercentage: number;
        batchName: string;
        className: string;
        // Full details for modal
        mobileNumber?: string;
        parentName?: string;
        parentMobile?: string;
        address?: string;
        aadharNumber?: string;
        apaarId?: string;
    }
};

export default function StudentDashboardView({ student }: StudentDashboardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;

    // Determine academic year based on semester or just show selection?
    // For now, keep the selection UI as it was in the mock.
    const currentYear = student.currentSemester.split('-')[0] === '1' ? '1st Year' :
        student.currentSemester.split('-')[0] === '2' ? '2nd Year' :
            student.currentSemester.split('-')[0] === '3' ? '3rd Year' : '4th Year';

    return (
        <div className="min-h-screen bg-gray-50">
            <StudentDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                student={{
                    ...student,
                    isActive: true, // Assuming active if logged in
                }}
            />

            {/* Header */}
            <header className="bg-indigo-900 text-white py-4 px-6 shadow-lg">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">AI Department - Student Portal</h1>
                        <p className="text-indigo-200 text-sm">SVR Engineering College (Autonomous), Nandyal</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-4">
                            <span className="text-sm font-medium opacity-90">Hello, {student.name}</span>
                        </div>
                        <Link href="/api/auth/signout" className="text-sm bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors">
                            Logout
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6">
                {/* Student Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex items-end -mt-16 mb-4">
                            <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl">
                                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center">
                                    <User className="w-16 h-16 text-indigo-400" />
                                </div>
                            </div>
                            <div className="ml-6 mb-2 flex-1">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800">{student.name}</h2>
                                        <p className="text-indigo-600 font-medium">Student ID: {student.registerNumber}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mb-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm flex items-center gap-2"
                                    >
                                        <User size={16} /> View Full Profile
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Class Info Display */}
                        <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                            <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                Class Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Class & Batch</p>
                                    <p className="font-semibold text-gray-800">{student.className} ({student.batchName})</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Current Semester</p>
                                    <p className="font-semibold text-gray-800">{student.currentSemester}</p>
                                    <button onClick={() => setIsModalOpen(true)} className="text-xs text-indigo-600 hover:text-indigo-800 underline mt-1">View Data</button>
                                </div>
                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <p className="text-sm text-gray-500 mb-1">Academic Year</p>
                                    <p className="font-semibold text-gray-800">{currentYear}</p>
                                </div>
                            </div>
                        </div>

                        {/* Academic Year Selection */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                Select Academic Year Shortcuts
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {academicYears.map((year) => (
                                    <button
                                        key={year}
                                        className={`p-4 rounded-xl border-2 transition-all text-center font-medium ${year === currentYear
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700'
                                            }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Overall Attendance</p>
                                <p className="text-2xl font-bold text-gray-800">{student.attendancePercentage}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">CGPA</p>
                                <p className="text-2xl font-bold text-gray-800">{student.cgpa}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Current Semester</p>
                                    <p className="text-2xl font-bold text-gray-800">{student.currentSemester}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full mt-2 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <User size={14} /> View Student Data
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

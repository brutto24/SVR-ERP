"use client";

import { useState } from 'react';
import Link from 'next/link';
import { mockStudents } from '@/lib/data';

export default function StudentDashboard() {
  // Mock current student (in real app, this would come from auth)
  const student = mockStudents[0];
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">AI Department - Student Portal</h1>
            <p className="text-indigo-200 text-sm">SVR Engineering College (Autonomous), Nandyal</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors">
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
                  <svg className="w-16 h-16 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6 mb-2">
                <h2 className="text-3xl font-bold text-gray-800">{student.name}</h2>
                <p className="text-indigo-600 font-medium">Student ID: {student.id}</p>
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
                  <p className="text-sm text-gray-500 mb-1">Class</p>
                  <p className="font-semibold text-gray-800">{student.class}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Batch</p>
                  <p className="font-semibold text-gray-800">{student.batch}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Section</p>
                  <p className="font-semibold text-gray-800">{student.section}</p>
                </div>
              </div>
            </div>

            {/* Academic Year Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Select Academic Year
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {academicYears.map((year) => (
                  <Link
                    key={year}
                    href={`/student/${year.toLowerCase().replace(' ', '-')}`}
                    className={`p-4 rounded-xl border-2 transition-all text-center font-medium ${
                      year === student.academicYear
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-700'
                    }`}
                  >
                    {year}
                  </Link>
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
                <p className="text-2xl font-bold text-gray-800">85%</p>
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
                <p className="text-2xl font-bold text-gray-800">8.5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Semester</p>
                <p className="text-2xl font-bold text-gray-800">Odd (1st)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

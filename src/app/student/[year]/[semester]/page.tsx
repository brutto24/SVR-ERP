"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { mockStudents, subjects } from '@/lib/data';

export default function SemesterPage({ params }: { params: { year: string; semester: string } }) {
  const yearParam = params.year.replace(/-/g, ' ');
  const formattedYear = yearParam.charAt(0).toUpperCase() + yearParam.slice(1);
  const semesterName = params.semester === 'odd' ? 'Semester - 1 (Odd)' : 'Semester - 2 (Even)';
  
  const student = mockStudents[0];
  const yearSubjects = subjects[formattedYear as keyof typeof subjects] || [];

  // Generate stable mock data using useMemo
  const subjectsWithData = useMemo(() => {
    return yearSubjects.map((subject, idx) => ({
      ...subject,
      attendance: 78 + idx,
      mid1Marks: 18 + (idx % 10),
      mid2Marks: 20 + (idx % 8)
    }));
  }, [yearSubjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link href={`/student/${params.year}`} className="text-indigo-300 hover:text-white text-sm flex items-center gap-1 mb-1">
              ← Back to {formattedYear}
            </Link>
            <h1 className="text-xl font-bold">AI Department - {semesterName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-indigo-800 px-3 py-1 rounded-full">
              {student.id} | {student.name}
            </span>
            <Link href="/login" className="text-sm bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Semester Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{semesterName}</h2>
              <p className="text-gray-500">{formattedYear} | Academic Year 2024-2025</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Subjects Enrolled</p>
              <p className="text-3xl font-bold text-indigo-600">{yearSubjects.length}</p>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-indigo-600 text-white px-6 py-4">
            <h3 className="font-semibold">Enrolled Subjects</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {subjectsWithData.map((subject, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${subject.isLab ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {subject.isLab ? 'Lab' : 'Theory'}
                    </span>
                    <span className="text-xs text-gray-500">{subject.code}</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-3">{subject.name}</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Attendance:</span>
                      <span className={`font-medium ${subject.attendance < 75 ? 'text-red-600' : 'text-green-600'}`}>
                        {subject.attendance}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">MID-1:</span>
                      <span className="font-medium text-gray-700">{subject.mid1Marks}/30</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">MID-2:</span>
                      <span className="font-medium text-gray-700">{subject.mid2Marks}/30</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/student/${params.year}`}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                ← Back
              </Link>
              <Link
                href={`/student/${params.year}/marks/mid-1`}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                View MID-1 Marks
              </Link>
              <Link
                href={`/student/${params.year}/marks/mid-2`}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                View MID-2 Marks
              </Link>
              <Link
                href={`/student/${params.year}/marks/sem-total`}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                View SEM/TOTAL
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

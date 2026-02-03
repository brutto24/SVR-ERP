"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockStudents, subjects } from '@/lib/data';

export default function StudentYearPage({ params }: { params: { year: string } }) {
  const yearParam = params.year.replace(/-/g, ' ');
  const formattedYear = yearParam.charAt(0).toUpperCase() + yearParam.slice(1);
  
  const student = mockStudents[0];
  const yearSubjects = subjects[formattedYear as keyof typeof subjects] || [];
  
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'marks'>('overview');

  const semesters = [
    { id: 'odd', name: 'Semester - 1 (Odd)' },
    { id: 'even', name: 'Semester - 2 (Even)' }
  ];

  // Generate stable mock data using useMemo
  const attendanceData = useMemo(() => {
    return yearSubjects.map((subject, idx) => ({
      subject: subject.name,
      totalClasses: 30 + (idx * 2),
      present: 25 + idx,
      percentage: 78 + idx
    }));
  }, [yearSubjects]);

  const marksData = useMemo(() => {
    return yearSubjects.map((subject, idx) => ({
      subject: subject.name,
      isLab: subject.isLab,
      mid1: {
        written: 12 + (idx % 5),
        bitPaper: 8 + (idx % 3),
        assignment: 4 + (idx % 2),
        total: 24 + idx
      },
      mid2: {
        written: 14 + (idx % 4),
        bitPaper: 9 + (idx % 2),
        assignment: 5,
        total: 28 + idx
      },
      external: subject.isLab ? 45 : 52,
      internalMin: 15,
      externalMin: 25,
      credits: subject.isLab ? 1.5 : 3
    }));
  }, [yearSubjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/student" className="text-indigo-300 hover:text-white text-sm flex items-center gap-1 mb-1">
              ← Back to Dashboard
            </Link>
            <h1 className="text-xl font-bold">AI Department - {formattedYear}</h1>
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
        {/* Semester Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Semester</h2>
          <div className="flex gap-4">
            {semesters.map((sem) => (
              <Link
                key={sem.id}
                href={`/student/${params.year}/${sem.id}`}
                className="flex-1 p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center font-medium text-gray-700"
              >
                {sem.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            {['overview', 'attendance', 'marks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                {/* Attendance Overview */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Attendance Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {attendanceData.map((att, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          att.percentage < 75 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{att.subject}</span>
                          <span
                            className={`text-sm font-bold ${
                              att.percentage < 75 ? 'text-red-600' : 'text-green-600'
                            }`}
                          >
                            {att.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              att.percentage < 75 ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${att.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {att.present}/{att.totalClasses} classes attended
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Marks Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Marks Summary
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marksData.filter(m => !m.isLab).map((mark, idx) => {
                      const totalMid1 = mark.mid1.total;
                      const totalMid2 = mark.mid2.total;
                      const avgInternal = Math.round((Math.max(totalMid1, totalMid2) * 0.8 + Math.min(totalMid1, totalMid2) * 0.2));
                      
                      return (
                        <div key={idx} className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="font-medium text-gray-800 mb-2">{mark.subject}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">MID-1:</span>
                              <span className="font-medium ml-1">{totalMid1}/30</span>
                            </div>
                            <div>
                              <span className="text-gray-500">MID-2:</span>
                              <span className="font-medium ml-1">{totalMid2}/30</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Internal:</span>
                              <span className="font-medium ml-1">{avgInternal}/30</span>
                            </div>
                            <div>
                              <span className="text-gray-500">External:</span>
                              <span className="font-medium ml-1">{mark.external}/70</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-indigo-50">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-indigo-900">Subject</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-indigo-900">Total Classes</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-indigo-900">Present</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-indigo-900">Absent</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-indigo-900">Percentage</th>
                        <th className="py-3 px-4 text-center text-sm font-semibold text-indigo-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((att, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-800">{att.subject}</td>
                          <td className="py-3 px-4 text-center text-sm text-gray-600">{att.totalClasses}</td>
                          <td className="py-3 px-4 text-center text-sm text-green-600 font-medium">{att.present}</td>
                          <td className="py-3 px-4 text-center text-sm text-red-600 font-medium">
                            {att.totalClasses - att.present}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`font-medium ${att.percentage < 75 ? 'text-red-600' : 'text-green-600'}`}>
                              {att.percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {att.percentage < 75 ? (
                              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">Low</span>
                            ) : (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Good</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'marks' && (
              <div>
                <div className="flex gap-4 mb-6">
                  {['MID-1', 'MID-2', 'SEM / TOTAL'].map((exam) => (
                    <Link
                      key={exam}
                      href={`/student/${params.year}/marks/${exam.toLowerCase().replace(/[\/\s]/g, '-')}`}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                    >
                      {exam}
                    </Link>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marksData.filter(m => !m.isLab).map((mark, idx) => {
                    const mid1Total = mark.mid1.total;
                    const mid2Total = mark.mid2.total;
                    const avgInternal = Math.round((Math.max(mid1Total, mid2Total) * 0.8 + Math.min(mid1Total, mid2Total) * 0.2));
                    const totalMarks = avgInternal + mark.external;

                    return (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                        <h4 className="font-semibold text-gray-800 mb-3">{mark.subject}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">MID-1 Total:</span>
                            <span className="font-medium">{mid1Total}/30</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">MID-2 Total:</span>
                            <span className="font-medium">{mid2Total}/30</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-700 font-medium">Internal (Avg):</span>
                            <span className="font-bold text-indigo-600">{avgInternal}/30</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">External:</span>
                            <span className="font-medium">{mark.external}/70</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="text-gray-700 font-bold">Total Marks:</span>
                            <span className="font-bold text-xl text-green-600">{totalMarks}/100</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Min Internal: {mark.internalMin}</span>
                            <span>Min External: {mark.externalMin}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Labs Section */}
                {marksData.filter(m => m.isLab).length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Laboratory Subjects</h3>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <p className="text-sm text-amber-800">
                        ℹ️ Laboratory subjects appear only in MID-2 and SEM/TOTAL results.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {marksData.filter(m => m.isLab).map((mark, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
                          <h4 className="font-semibold text-gray-800 mb-3">{mark.subject}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">External (Lab):</span>
                              <span className="font-medium">{mark.external}/50</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Internal (Avg):</span>
                              <span className="font-medium">{Math.round(mark.mid2.total * 0.5)}/25</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-700 font-bold">Total:</span>
                              <span className="font-bold text-green-600">{mark.external + Math.round(mark.mid2.total * 0.5)}/75</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

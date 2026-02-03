"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { mockStudents, subjects } from '@/lib/data';

export default function MarksDetailPage({ params }: { params: { year: string; exam: string } }) {
  const yearParam = params.year.replace(/-/g, ' ');
  const formattedYear = yearParam.charAt(0).toUpperCase() + yearParam.slice(1);
  const examType = params.exam.replace(/-/g, ' ').toUpperCase();
  
  const student = mockStudents[0];
  const yearSubjects = subjects[formattedYear as keyof typeof subjects] || [];
  
  // Generate stable mock marks data using useMemo
  const marksData = useMemo(() => {
    return yearSubjects.map((subject, idx) => ({
      subject: subject.name,
      isLab: subject.isLab,
      written: 12 + (idx % 8),
      bitPaper: 8 + (idx % 5),
      assignment: 3 + (idx % 3),
      total: 0,
      credits: subject.isLab ? 1.5 : 3
    })).map(m => ({
      ...m,
      total: m.written + m.bitPaper + m.assignment
    }));
  }, [yearSubjects]);

  const theorySubjects = marksData.filter(m => !m.isLab);
  const labSubjects = marksData.filter(m => m.isLab);

  // Lab marks with stable values
  const labMarksData = useMemo(() => {
    return labSubjects.map((subject, idx) => ({
      subject: subject.subject,
      written: 6 + (idx % 4),
      labWork: 15 + (idx % 5),
      viva: 7 + (idx % 3),
      record: 3 + (idx % 2),
      total: 0
    })).map(m => ({
      ...m,
      total: m.written + m.labWork + m.viva + m.record
    }));
  }, [labSubjects]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link href={`/student/${params.year}`} className="text-indigo-300 hover:text-white text-sm flex items-center gap-1 mb-1">
              ← Back to {formattedYear}
            </Link>
            <h1 className="text-xl font-bold">AI Department - {examType} Marks</h1>
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
        {/* Exam Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{examType} Examination Results</h2>
              <p className="text-gray-500">{formattedYear} | Semester 1</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="text-3xl font-bold text-indigo-600">
                {theorySubjects.reduce((sum, s) => sum + s.total, 0)}/{theorySubjects.length * 30}
              </p>
            </div>
          </div>
        </div>

        {/* Theory Subjects */}
        {theorySubjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h3 className="font-semibold">Theory Subjects</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-indigo-900">Subject</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-indigo-900">Written (20)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-indigo-900">Bit Paper (15)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-indigo-900">Assignment (5)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-indigo-900">Total (30)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-indigo-900">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {theorySubjects.map((subject, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-800 font-medium">{subject.subject}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-sm ${subject.written < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                          {subject.written}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-sm ${subject.bitPaper < 7 ? 'text-red-600' : 'text-gray-700'}`}>
                          {subject.bitPaper}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-sm ${subject.assignment < 3 ? 'text-red-600' : 'text-gray-700'}`}>
                          {subject.assignment}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-sm font-bold ${subject.total < 15 ? 'text-red-600' : 'text-green-600'}`}>
                          {subject.total}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-600">{subject.credits}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={4} className="py-4 px-4 text-right font-semibold text-gray-800">Total:</td>
                    <td className="py-4 px-4 text-center font-bold text-indigo-600">
                      {theorySubjects.reduce((sum, s) => sum + s.total, 0)}/{theorySubjects.length * 30}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-gray-800">
                      {theorySubjects.reduce((sum, s) => sum + s.credits, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Lab Subjects - Only show for MID-2 and SEM */}
        {(params.exam === 'mid-2' || params.exam === 'sem-total') && labMarksData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-amber-600 text-white px-6 py-4">
              <h3 className="font-semibold">Laboratory Subjects</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-amber-900">Subject</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-amber-900">Written (10)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-amber-900">Lab Work (20)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-amber-900">Viva (10)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-amber-900">Record (5)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-amber-900">Total (45)</th>
                    <th className="py-4 px-4 text-center text-sm font-semibold text-amber-900">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {labMarksData.map((lab, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4 text-sm text-gray-800 font-medium">{lab.subject}</td>
                      <td className="py-4 px-4 text-center text-sm text-gray-700">{lab.written}</td>
                      <td className="py-4 px-4 text-center text-sm text-gray-700">{lab.labWork}</td>
                      <td className="py-4 px-4 text-center text-sm text-gray-700">{lab.viva}</td>
                      <td className="py-4 px-4 text-center text-sm text-gray-700">{lab.record}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-sm font-bold ${lab.total < 23 ? 'text-red-600' : 'text-green-600'}`}>
                          {lab.total}/45
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-600">1.5</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notice for MID-1 */}
        {params.exam === 'mid-1' && labSubjects.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-amber-800">
              ℹ️ Note: Laboratory subjects appear only in MID-2 and SEM/TOTAL examinations.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex gap-4">
          <Link
            href={`/student/${params.year}`}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
          {params.exam !== 'mid-1' && (
            <Link
              href={`/student/${params.year}/marks/mid-1`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              View MID-1
            </Link>
          )}
          {params.exam !== 'mid-2' && (
            <Link
              href={`/student/${params.year}/marks/mid-2`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              View MID-2
            </Link>
          )}
          {params.exam !== 'sem-total' && (
            <Link
              href={`/student/${params.year}/marks/sem-total`}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              View SEM/TOTAL
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

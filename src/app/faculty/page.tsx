"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockFaculty, subjects } from '@/lib/data';

export default function FacultyDashboard() {
  const faculty = mockFaculty[0]; // HOD by default
  const [activeSection, setActiveSection] = useState<'dashboard' | 'attendance' | 'marks' | 'students'>('dashboard');

  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sections = ['Section A', 'Section B'];
  const periods = [1, 2, 3, 4, 5, 6];

  // Mock class schedule
  const classSchedule = [
    { period: 1, time: '09:00 - 09:50', subject: 'AI Fundamentals', year: '2nd Year', section: 'Section A' },
    { period: 2, time: '09:50 - 10:40', subject: 'Data Structures', year: '2nd Year', section: 'Section A' },
    { period: 3, time: '10:55 - 11:45', subject: 'OOP Lab', year: '2nd Year', section: 'Section A' },
    { period: 4, time: '11:45 - 12:35', subject: 'DBMS', year: '2nd Year', section: 'Section B' },
    { period: 5, time: '01:30 - 02:20', subject: 'OS', year: '2nd Year', section: 'Section A' },
    { period: 6, time: '02:20 - 03:10', subject: 'Mentoring', year: '2nd Year', section: 'Section A' },
  ];

  // Mock students list
  const studentsList = [
    { id: '23A1AI01', name: 'John Smith', attendance: 85, status: 'Present' },
    { id: '23A1AI02', name: 'Emma Johnson', attendance: 92, status: 'Present' },
    { id: '23A1AI03', name: 'Michael Brown', attendance: 78, status: 'Present' },
    { id: '23A1AI04', name: 'Sarah Davis', attendance: 88, status: 'Present' },
    { id: '23A1AI05', name: 'David Wilson', attendance: 95, status: 'Present' },
    { id: '23A1AI06', name: 'Lisa Anderson', attendance: 72, status: 'Present' },
    { id: '23A1AI07', name: 'James Taylor', attendance: 90, status: 'Present' },
    { id: '23A1AI08', name: 'Jennifer Martinez', attendance: 85, status: 'Present' },
  ];

  // Mock marks data with stable values using useMemo
  const mockMarksData = useMemo(() => {
    return studentsList.slice(0, 5).map((student, idx) => ({
      student,
      written: 12 + (idx % 8),
      bitPaper: 8 + (idx % 5),
      assignment: 3 + (idx % 3),
      total: 23 + (idx % 10)
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">AI Department - Faculty Portal</h1>
            <p className="text-indigo-200 text-sm">SVR Engineering College (Autonomous), Nandyal</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-indigo-800 px-3 py-1 rounded-full">
              {faculty.name} | {faculty.role}
            </span>
            <Link href="/login" className="text-sm bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors">
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'attendance', label: 'Attendance', icon: '✅' },
              { id: 'marks', label: 'Marks Entry', icon: '📝' },
              { id: 'students', label: 'Students', icon: '👥' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as typeof activeSection)}
                className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeSection === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeSection === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {faculty.name}</h2>
                
                {/* Today's Classes */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    📅 Today&apos;s Classes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classSchedule.map((cls, idx) => (
                      <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">
                            Period {cls.period}
                          </span>
                          <span className="text-xs text-gray-500">{cls.time}</span>
                        </div>
                        <p className="font-semibold text-gray-800">{cls.subject}</p>
                        <p className="text-sm text-gray-600">{cls.year} - {cls.section}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Low Attendance</p>
                        <p className="text-2xl font-bold text-red-600">5</p>
                        <p className="text-xs text-gray-400">Students below 75%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pending Marks</p>
                        <p className="text-2xl font-bold text-amber-600">12</p>
                        <p className="text-xs text-gray-400">MID-2 entries pending</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Classes Today</p>
                        <p className="text-2xl font-bold text-green-600">6</p>
                        <p className="text-xs text-gray-400">All scheduled completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'attendance' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance Management</h2>
                
                {/* Class Selection */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Class</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {academicYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {sections.map((section) => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {subjects['2nd Year'].map((sub) => (
                          <option key={sub.code} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <div className="flex gap-2">
                      {periods.map((period) => (
                        <button
                          key={period}
                          className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-colors"
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attendance Entry */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-semibold">Student List</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm">Mark All Present</button>
                      <button className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm">Mark All Absent</button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">S.No</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Student ID</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Attendance %</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsList.map((student, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">{idx + 1}</td>
                            <td className="py-3 px-4 text-sm text-gray-800">{student.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">{student.name}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm font-medium ${student.attendance < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                {student.attendance}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                ✓
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                      Save Attendance
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'marks' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Marks Management</h2>
                
                {/* Exam Selection */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Exam & Class</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <option value="mid1">MID-1</option>
                        <option value="mid2">MID-2</option>
                        <option value="sem">SEM / TOTAL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {academicYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {sections.map((section) => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        {subjects['2nd Year'].map((sub) => (
                          <option key={sub.code} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Marks Entry Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-amber-500 text-white px-6 py-4">
                    <h3 className="font-semibold">MID-1 Marks Entry - Data Structures (2nd Year - Section A)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">S.No</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Student ID</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Written (20)</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Bit Paper (15)</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Assignment (5)</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Total (30)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockMarksData.map((data, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">{idx + 1}</td>
                            <td className="py-3 px-4 text-sm text-gray-800">{data.student.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">{data.student.name}</td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                defaultValue={data.written}
                                min="0"
                                max="20"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                defaultValue={data.bitPaper}
                                min="0"
                                max="15"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                defaultValue={data.assignment}
                                min="0"
                                max="5"
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-bold text-indigo-600">{data.total}/30</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      ℹ️ All marks can be modified anytime. Changes are saved automatically.
                    </p>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
                        Save Marks
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'students' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Management</h2>
                
                {/* Search and Filter */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                      <input
                        type="text"
                        placeholder="Enter Student ID or Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Years</option>
                        {academicYears.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        <option value="">All Sections</option>
                        {sections.map((section) => (
                          <option key={section} value={section}>{section}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                        Search
                      </button>
                    </div>
                  </div>
                </div>

                {/* Student List */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-semibold">Student Records (2nd Year - Section A)</h3>
                    <button className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm">
                      + Add Student
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">S.No</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Student ID</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Attendance</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">CGPA</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsList.map((student, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">{idx + 1}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">{student.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-800">{student.name}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm font-medium ${student.attendance < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                {student.attendance}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-sm text-gray-700">8.5</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded text-xs">
                                  View
                                </button>
                                <button className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded text-xs">
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from 'react';
import Link from 'next/link';
import { mockFaculty, subjects, mockStudents } from '@/lib/data';

export default function HODDashboard() {
  const hod = mockFaculty[0]; // HOD
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'marks' | 'reports'>('overview');

  const academicYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sections = ['Section A', 'Section B'];

  // Mock department statistics
  const departmentStats = {
    totalStudents: 120,
    totalFaculty: 8,
    avgAttendance: 82,
    lowAttendanceStudents: 8,
    pendingMarks: 15,
    avgCGPA: 8.2
  };

  // Mock faculty list
  const facultyList = [
    { id: 'FAC001', name: 'Dr. Rajesh Kumar', role: 'HOD', subjects: ['All'], status: 'Active' },
    { id: 'FAC002', name: 'Prof. Sarah Devi', role: 'Faculty', subjects: ['AI', 'ML', 'Deep Learning'], status: 'Active' },
    { id: 'FAC003', name: 'Dr. Arun Kumar', role: 'Faculty', subjects: ['Data Structures', 'Algorithms'], status: 'Active' },
    { id: 'FAC004', name: 'Prof. Priya Sharma', role: 'Faculty', subjects: ['DBMS', 'Web Technologies'], status: 'On Leave' },
  ];

  // Mock low attendance students
  const lowAttendanceStudents = [
    { id: '23A1AI06', name: 'Lisa Anderson', year: '2nd Year', section: 'A', attendance: 68, subjects: ['DBMS', 'OS'] },
    { id: '23A1AI15', name: 'Robert Lee', year: '2nd Year', section: 'B', attendance: 72, subjects: ['AI', 'Data Structures'] },
    { id: '23A1AI22', name: 'Amanda White', year: '3rd Year', section: 'A', attendance: 70, subjects: ['ML', 'CN'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/faculty" className="text-red-300 hover:text-white text-sm">
                ← Back to Faculty Portal
              </Link>
            </div>
            <h1 className="text-xl font-bold">🛡️ HOD Admin Dashboard</h1>
            <p className="text-red-200 text-sm">Department of CSE - AI | SVR Engineering College</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm bg-red-800 px-3 py-1 rounded-full">
              {hod.name} | HOD
            </span>
            <Link href="/login" className="text-sm bg-red-700 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors">
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
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'attendance', label: 'Attendance Monitor', icon: '📋' },
              { id: 'marks', label: 'Marks Verification', icon: '✅' },
              { id: 'reports', label: 'Reports', icon: '📑' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Department Overview</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 text-sm font-medium">Total Students</h3>
                      <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-4xl font-bold text-indigo-600">{departmentStats.totalStudents}</p>
                    <p className="text-sm text-gray-500 mt-1">Across all years</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 text-sm font-medium">Total Faculty</h3>
                      <span className="text-3xl">👨‍🏫</span>
                    </div>
                    <p className="text-4xl font-bold text-green-600">{departmentStats.totalFaculty}</p>
                    <p className="text-sm text-gray-500 mt-1">Active members</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 text-sm font-medium">Avg Attendance</h3>
                      <span className="text-3xl">📈</span>
                    </div>
                    <p className="text-4xl font-bold text-amber-600">{departmentStats.avgAttendance}%</p>
                    <p className="text-sm text-gray-500 mt-1">Department average</p>
                  </div>

                  <div className="bg-white border border-red-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 text-sm font-medium">Low Attendance</h3>
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <p className="text-4xl font-bold text-red-600">{departmentStats.lowAttendanceStudents}</p>
                    <p className="text-sm text-gray-500 mt-1">Students below 75%</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 text-sm font-medium">Pending Marks</h3>
                      <span className="text-3xl">📝</span>
                    </div>
                    <p className="text-4xl font-bold text-amber-600">{departmentStats.pendingMarks}</p>
                    <p className="text-sm text-gray-500 mt-1">Entries to be verified</p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-600 text-sm font-medium">Avg CGPA</h3>
                      <span className="text-3xl">🎓</span>
                    </div>
                    <p className="text-4xl font-bold text-green-600">{departmentStats.avgCGPA}</p>
                    <p className="text-sm text-gray-500 mt-1">Overall department</p>
                  </div>
                </div>

                {/* Faculty Overview */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
                    <h3 className="font-semibold">Faculty Members</h3>
                    <button className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded text-sm">
                      + Add Faculty
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">ID</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Name</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Subjects</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Status</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyList.map((fac, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">{fac.id}</td>
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">{fac.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{fac.role}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{fac.subjects.join(', ')}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-xs px-2 py-1 rounded-full ${fac.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {fac.status}
                              </span>
                            </td>
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

            {activeTab === 'attendance' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance Monitoring</h2>
                
                {/* Low Attendance Alert */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <h3 className="text-red-800 font-semibold mb-3 flex items-center gap-2">
                    ⚠️ Students Requiring Attention (Below 75%)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-red-100">
                          <th className="py-2 px-3 text-left text-xs font-semibold text-red-800">Student ID</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-red-800">Name</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-red-800">Year/Section</th>
                          <th className="py-2 px-3 text-center text-xs font-semibold text-red-800">Attendance</th>
                          <th className="py-2 px-3 text-left text-xs font-semibold text-red-800">Problem Subjects</th>
                          <th className="py-2 px-3 text-center text-xs font-semibold text-red-800">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowAttendanceStudents.map((student, idx) => (
                          <tr key={idx} className="border-b border-red-200">
                            <td className="py-2 px-3 text-sm text-red-800">{student.id}</td>
                            <td className="py-2 px-3 text-sm text-red-800 font-medium">{student.name}</td>
                            <td className="py-2 px-3 text-sm text-red-800">{student.year} - {student.section}</td>
                            <td className="py-2 px-3 text-center text-sm font-bold text-red-600">{student.attendance}%</td>
                            <td className="py-2 px-3 text-sm text-red-700">{student.subjects.join(', ')}</td>
                            <td className="py-2 px-3 text-center">
                              <button className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">
                                Notify
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Class-wise Attendance */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Class-wise Attendance Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {academicYears.map((year) => (
                      <div key={year} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">{year}</h4>
                        {sections.map((section) => {
                          const attendance = Math.floor(Math.random() * 15) + 75;
                          return (
                            <div key={section} className="flex items-center justify-between py-2 border-b last:border-0">
                              <span className="text-sm text-gray-600">{section}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${attendance < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                                    style={{ width: `${attendance}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-medium ${attendance < 75 ? 'text-red-600' : 'text-green-600'}`}>
                                  {attendance}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'marks' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Marks Verification</h2>
                
                {/* Pending Verification */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <h3 className="text-amber-800 font-semibold mb-3 flex items-center gap-2">
                    📝 Pending Verification
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <p className="text-sm text-gray-600">MID-1 - Data Structures</p>
                      <p className="text-lg font-bold text-amber-600">2nd Year - A</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted by: Prof. Sarah Devi</p>
                      <button className="mt-2 w-full px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm">
                        Verify
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <p className="text-sm text-gray-600">MID-1 - DBMS</p>
                      <p className="text-lg font-bold text-amber-600">2nd Year - B</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted by: Dr. Arun Kumar</p>
                      <button className="mt-2 w-full px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm">
                        Verify
                      </button>
                    </div>
                    <div className="bg-4 border border-white rounded-lg p-amber-200">
                      <p className="text-sm text-gray-600">MID-2 - AI Fundamentals</p>
                      <p className="text-lg font-bold text-amber-600">2nd Year - A</p>
                      <p className="text-xs text-gray-500 mt-1">Submitted by: Prof. Priya Sharma</p>
                      <button className="mt-2 w-full px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm">
                        Verify
                      </button>
                    </div>
                  </div>
                </div>

                {/* All Marks Overview */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-indigo-600 text-white px-6 py-4">
                    <h3 className="font-semibold">Marks Entry Status</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Subject</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Year</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">MID-1</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">MID-2</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">SEM</th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects['2nd Year'].map((sub, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">{sub.name}</td>
                            <td className="py-3 px-4 text-center text-sm text-gray-600">2nd Year</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`text-sm ${sub.isLab ? 'text-gray-400' : 'text-green-600'}`}>
                                {sub.isLab ? 'N/A' : '✅'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-green-600">✅</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-amber-600">⏳</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                                In Progress
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h2>
                
                {/* Quick Report Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Attendance Report</h3>
                    <p className="text-sm text-gray-500 mb-4">Generate detailed attendance reports for all classes</p>
                    <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                      Generate
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Marks Report</h3>
                    <p className="text-sm text-gray-500 mb-4">Export marksheets and result analysis</p>
                    <button className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors">
                      Generate
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Student Report</h3>
                    <p className="text-sm text-gray-500 mb-4">Individual student performance reports</p>
                    <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                      Generate
                    </button>
                  </div>
                </div>

                {/* Download Options */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Downloads</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Attendance Register - February 2024</p>
                        <p className="text-sm text-gray-500">PDF Format</p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">MID-1 Result Analysis</p>
                        <p className="text-sm text-gray-500">Excel Format</p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Student List - All Years</p>
                        <p className="text-sm text-gray-500">PDF Format</p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">Department Statistics</p>
                        <p className="text-sm text-gray-500">Summary Report</p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                        Download
                      </button>
                    </div>
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

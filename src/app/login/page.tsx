"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState<'student' | 'faculty' | null>(null);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication - in real app, this would validate against backend
    if (role === 'student') {
      router.push('/student');
    } else if (role === 'faculty') {
      router.push('/faculty');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-900 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">SVR Engineering College</h1>
          <p className="text-indigo-200 text-sm mt-1">(Autonomous), Nandyal</p>
          <p className="text-indigo-300 text-xs mt-2">Department of CSE - Artificial Intelligence</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {role ? `${role === 'student' ? 'Student' : 'Faculty / HOD'} Login` : 'Welcome'}
          </h2>

          {!role ? (
            // Role Selection
            <div className="space-y-4">
              <button
                onClick={() => setRole('student')}
                className="w-full p-4 border-2 border-indigo-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">Student Login</h3>
                    <p className="text-sm text-gray-500">View attendance, marks & results</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setRole('faculty')}
                className="w-full p-4 border-2 border-indigo-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center group-hover:bg-amber-200">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">Faculty / HOD Login</h3>
                    <p className="text-sm text-gray-500">Manage attendance, marks & student data</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            // Login Form
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {role === 'student' ? 'Student ID' : 'Faculty ID / Email'}
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder={role === 'student' ? 'e.g., 23A1AI01' : 'Enter your ID'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => setRole(null)}
                className="w-full py-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                ← Back to role selection
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            🔐 Secure Login • Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
}

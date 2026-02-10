"use client";

import { useState } from 'react';
import Link from 'next/link';
import FacultyTimetable from "@/components/admin/FacultyTimetable";
import { TimetableEntry } from "@/actions/timetable";
import {
    Calendar,
    CheckSquare,
    FileSpreadsheet,
    Users,
    Clock,
    BookOpen,
    GraduationCap,
    ArrowRight
} from "lucide-react";

type AssignedMeta = {
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    batchId: string;
    semester: string;
};

export default function FacultyDashboardClient({
    faculty,
    initialTimetable,
    assignments
}: {
    faculty: any;
    initialTimetable: TimetableEntry[];
    assignments: AssignedMeta[];
}) {
    // Current Day Logic
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysClasses = initialTimetable.filter(t => t.dayOfWeek === today);

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 shadow-lg text-white">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome, {faculty.name}</h1>
                    <p className="text-indigo-100 opacity-90 mb-6">Faculty Dashboard • {faculty.designation}</p>

                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 border border-white/10">
                            <Clock className="w-5 h-5 text-indigo-200" />
                            <span><span className="font-bold">{todaysClasses.length}</span> Classes Today</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2 border border-white/10">
                            <BookOpen className="w-5 h-5 text-indigo-200" />
                            <span><span className="font-bold">{assignments.length}</span> Subjects Assigned</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-20 -mb-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl"></div>
            </div>

            {/* Timetable Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        My Schedule
                    </h2>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                    <FacultyTimetable
                        facultyId={faculty.id}
                        initialTimetable={initialTimetable}
                        assignments={assignments}
                    />
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef } from "react";
import { ChevronDown, Camera, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { uploadProfilePicture, deleteProfilePicture } from "@/actions/student";

const SEMESTERS = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];

type DashboardProps = {
    profile: {
        name: string;
        registerNumber: string;
        className: string;
        department: string;
        cgpa: string;
        sgpa: string;
        currentSemester: string;
        profilePicture?: string | null;
    };
    attendance: {
        subject: string;
        semester: string;
        total: number;
        present: number;
        percentage: number;
    }[];
    overallAttendance: number;
    monthlyAttendance: number;
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
    attendanceHistory: {
        id: string;
        date: Date;
        period: number;
        subject: string;
        status: string;
        semester: string;
    }[];
    timetable: {
        id: string;
        dayOfWeek: string;
        period: number;
        subjectId: string | null;
        subjectName: string | null;
    }[];
};

export default function StudentDashboardClient({ profile, attendance, marks, overallAttendance, monthlyAttendance, attendanceHistory, timetable }: DashboardProps) {
    const [activeSem, setActiveSem] = useState(profile.currentSemester || "2-1");
    const [internalView, setInternalView] = useState<"total" | "mid1" | "mid2" | "lab_internal">("total");
    const [externalView, setExternalView] = useState<"total" | "semester_external" | "lab_external">("total");
    const [isUploading, setIsUploading] = useState(false);
    const [isSemDropdownOpen, setIsSemDropdownOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const filteredAttendance = attendance.filter(a => a.semester === activeSem);
    const filteredMarks = marks.filter(m => m.semester === activeSem);

    // Calculate Semester Percentage
    const semTotalClasses = filteredAttendance.reduce((acc, curr) => acc + curr.total, 0);
    const semTotalPresent = filteredAttendance.reduce((acc, curr) => acc + curr.present, 0);
    const semPercentage = semTotalClasses > 0 ? Math.round((semTotalPresent / semTotalClasses) * 100) : 0;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("File size should be less than 2MB");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            const res = await uploadProfilePicture(base64);
            if (res.success) {
                router.refresh();
            } else {
                alert("Failed to upload");
            }
            setIsUploading(false);
        };
        reader.onerror = () => setIsUploading(false);
    };

    const handleDeleteProfilePic = async () => {
        if (!confirm("Are you sure you want to remove your profile picture?")) return;
        setIsUploading(true);
        const res = await deleteProfilePicture();
        if (res.success) {
            router.refresh();
        } else {
            alert("Failed to delete");
        }
        setIsUploading(false);
    };

    const [viewMode, setViewMode] = useState<"overall" | "month" | "timetable" | null>(null);

    const getFilteredHistory = () => {
        if (!viewMode || !attendanceHistory || viewMode === 'timetable') return [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return attendanceHistory.filter(r => {
            // Filter by Active Semester first? User might want to see all or just current sem.
            // Usually dashboard shows current sem stats, so history should probably align or show all.
            // Let's align with Active Sem for consistency, or all if requested.
            // Requirement says "day wise and period wise with subject name".
            // Let's filter by active semester to keep it relevant to the displayed stats.
            if (r.semester !== activeSem) return false;

            if (viewMode === 'month') {
                const d = new Date(r.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            }
            return true;
        });
    };

    const historyData = getFilteredHistory();

    return (
        <div className="space-y-6">
            {/* Modal for Attendance History or Timetable */}
            {viewMode && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewMode(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    {viewMode === 'overall' ? 'Attendance History' : viewMode === 'month' ? 'This Month\'s Attendance' : 'Class Timetable'}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {viewMode === 'timetable' ? `Weekly Schedule • ${activeSem}` : `${activeSem} • ${historyData.length} Classes Record`}
                                </p>
                            </div>
                            <button
                                onClick={() => setViewMode(null)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                            >
                                <ChevronDown className="w-5 h-5 rotate-180" /> {/* Using Chevron as Close for now or add X icon */}
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            {viewMode === 'timetable' ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-700">
                                                <th className="p-3 border text-left min-w-[120px] sticky left-0 bg-gray-100 font-bold">Day</th>
                                                {[1, 2, 3, 4, 5, 6, 7].map(p => (
                                                    <th key={p} className="p-3 border text-center font-bold">
                                                        {p}<br />
                                                        <span className="text-[10px] font-normal text-gray-500">
                                                            {p === 1 ? "09:30-10:20" :
                                                                p === 2 ? "10:20-11:10" :
                                                                    p === 3 ? "11:30-12:20" :
                                                                        p === 4 ? "12:20-01:10" :
                                                                            p === 5 ? "02:00-02:50" :
                                                                                p === 6 ? "02:50-03:40" : "03:40-04:30"}
                                                        </span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => {
                                                // Find entries for this day
                                                const dayEntries = timetable.filter(t => t.dayOfWeek === day);
                                                const hasEntries = dayEntries.length > 0;

                                                return (
                                                    <tr key={day} className="hover:bg-gray-50/50">
                                                        <td className="p-3 border font-medium text-gray-900 sticky left-0 bg-white">
                                                            {day}
                                                        </td>
                                                        {[1, 2, 3, 4, 5, 6, 7].map(period => {
                                                            const entry = dayEntries.find(e => e.period === period);
                                                            return (
                                                                <td key={period} className="p-2 border text-center align-middle h-16">
                                                                    {entry ? (
                                                                        <div className="flex flex-col items-center justify-center">
                                                                            <span className="font-semibold text-gray-800 text-xs line-clamp-2" title={entry.subjectName || ""}>
                                                                                {entry.subjectName?.replace(/Laboratory|Lab/i, 'Lab') || "-"}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-300">-</span>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                historyData.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 text-gray-700">
                                                    <th className="p-3 border text-left min-w-[140px] sticky left-0 bg-gray-100 font-bold">DayName</th>
                                                    <th className="p-3 border text-center font-bold">1<br /><span className="text-[10px] font-normal text-gray-500">(09:30-10:20)</span></th>
                                                    <th className="p-3 border text-center font-bold">2<br /><span className="text-[10px] font-normal text-gray-500">(10:20-11:10)</span></th>
                                                    <th className="p-3 border text-center font-bold">3<br /><span className="text-[10px] font-normal text-gray-500">(11:30-12:20)</span></th>
                                                    <th className="p-3 border text-center font-bold">4<br /><span className="text-[10px] font-normal text-gray-500">(12:20-01:10)</span></th>
                                                    <th className="p-3 border text-center font-bold">5<br /><span className="text-[10px] font-normal text-gray-500">(02:00-02:50)</span></th>
                                                    <th className="p-3 border text-center font-bold">6<br /><span className="text-[10px] font-normal text-gray-500">(02:50-03:40)</span></th>
                                                    <th className="p-3 border text-center font-bold">7<br /><span className="text-[10px] font-normal text-gray-500">(03:40-04:30)</span></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    // Pivot Data: Group by Date
                                                    const groupedByDate: Record<string, Record<number, { status: string, subject: string }>> = {};

                                                    historyData.forEach(r => {
                                                        const dateKey = new Date(r.date).toISOString().split('T')[0]; // YYYY-MM-DD
                                                        if (!groupedByDate[dateKey]) groupedByDate[dateKey] = {};
                                                        groupedByDate[dateKey][r.period] = { status: r.status, subject: r.subject };
                                                    });

                                                    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

                                                    return sortedDates.map(dateStr => {
                                                        const dateObj = new Date(dateStr);
                                                        const dayName = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                        const weekDay = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
                                                        const rowData = groupedByDate[dateStr];

                                                        return (
                                                            <tr key={dateStr} className="hover:bg-gray-50/50">
                                                                <td className="p-3 border font-medium text-gray-900 sticky left-0 bg-white">
                                                                    {dayName} <span className="text-gray-500">({weekDay})</span>
                                                                </td>
                                                                {[1, 2, 3, 4, 5, 6, 7].map(period => {
                                                                    const data = rowData[period];
                                                                    return (
                                                                        <td key={period} className="p-2 border text-center align-middle">
                                                                            {data ? (
                                                                                <span
                                                                                    title={data.subject}
                                                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded font-bold text-sm ${data.status === 'Present'
                                                                                        ? 'text-green-600'
                                                                                        : 'text-red-600'
                                                                                        }`}>
                                                                                    {data.status === 'Present' ? 'P' : 'A'}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-gray-300">-</span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        No attendance records found for this selection.
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Profile */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 shadow-md flex items-center justify-center border-4 border-white">
                        {profile.profilePicture ? (
                            <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-gray-400" />
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                            title="Upload Photo"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        {profile.profilePicture && (
                            <button
                                onClick={handleDeleteProfilePic}
                                className="p-1.5 bg-red-500/80 hover:bg-red-600/80 rounded-full text-white backdrop-blur-sm transition-colors"
                                title="Remove Photo"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center md:justify-start mt-2 text-sm text-gray-500">
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{profile.registerNumber}</span>
                                <span>{profile.className} - {profile.department}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewMode('timetable')}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 self-center md:self-auto"
                        >
                            View Timetable
                        </button>
                    </div>
                    <div className="flex gap-4 mt-4 justify-center md:justify-start">
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-xs text-gray-400 uppercase font-semibold">CGPA</div>
                            <div className="text-xl font-bold text-gray-800">{profile.cgpa}</div>
                        </div>
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-xs text-gray-400 uppercase font-semibold">SGPA</div>
                            <div className="text-xl font-bold text-gray-800">{profile.sgpa}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-4 rounded-xl shadow-lg shadow-indigo-200">
                    <div className="text-indigo-100 text-xs font-medium mb-1">Semester</div>
                    <div className="text-2xl font-bold">{activeSem}</div>
                </div>
            </div>

            {/* Attendance Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-indigo-500 rounded-full" /> Attendance Status
                    </h3>

                    {/* Summary Boxes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={() => setViewMode('overall')}
                            className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full -mr-4 -mt-4"></div>
                            <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-1">Overall</p>
                            <p className="text-2xl font-bold">{semPercentage}%</p>
                            <p className="text-[10px] text-indigo-200 mt-1 flex items-center gap-1">View History <ChevronDown className="w-3 h-3 -rotate-90" /></p>
                        </div>
                        <div
                            onClick={() => setViewMode('month')}
                            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform active:scale-95"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full -mr-4 -mt-4"></div>
                            <p className="text-purple-100 text-xs font-semibold uppercase tracking-wider mb-1">This Month</p>
                            <p className="text-2xl font-bold">{monthlyAttendance || 0}%</p>
                            <p className="text-[10px] text-purple-200 mt-1 flex items-center gap-1">View History <ChevronDown className="w-3 h-3 -rotate-90" /></p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Show Active Semester */}
                    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Showing data for Semester {activeSem}</div>

                    {filteredAttendance.map((sub, i) => (
                        <div key={i} className="group">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{sub.subject}</span>
                                <span className="font-bold text-indigo-600">{sub.percentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-500 group-hover:bg-indigo-600"
                                    style={{ width: `${sub.percentage}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                                {sub.present} / {sub.total} Classes Attended
                            </div>
                        </div>
                    ))}
                    {filteredAttendance.length === 0 && <div className="text-center text-gray-400 py-4">No attendance data found for this semester.</div>}
                </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-pink-500 rounded-full" /> Academic Performance
                    </h3>
                    <div className="relative">
                        <button
                            onClick={() => setIsSemDropdownOpen(!isSemDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                        >
                            Semester {activeSem} <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSemDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSemDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 max-h-60 overflow-y-auto">
                                {SEMESTERS.map(sem => (
                                    <button
                                        key={sem}
                                        onClick={() => { setActiveSem(sem); setIsSemDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${activeSem === sem ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'}`}
                                    >
                                        {sem}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Subject</th>
                                <th className="py-3 px-4 font-semibold">
                                    <div className="group relative inline-block">
                                        <button className="flex items-center gap-1 hover:text-indigo-600">
                                            Internal <ChevronDown className="w-3 h-3" />
                                        </button>
                                        <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-white border border-gray-100 shadow-lg rounded-lg z-10 min-w-[120px] p-1">
                                            <button onClick={() => setInternalView('total')} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded text-gray-700">Total</button>
                                            <button onClick={() => setInternalView('mid1')} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded text-gray-700">Mid-1</button>
                                            <button onClick={() => setInternalView('mid2')} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded text-gray-700">Mid-2</button>
                                            <button onClick={() => setInternalView('lab_internal')} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded text-gray-700">Labs</button>
                                        </div>
                                    </div>
                                    {internalView !== 'total' && <span className="text-xs text-indigo-500 block font-normal capitalize">{internalView.replace('_', ' ')}</span>}
                                    <span className="text-[10px] text-gray-400 font-normal block mt-0.5">(80% + 20%)</span>
                                </th>
                                <th className="py-3 px-4 font-semibold">
                                    <div className="group relative inline-block">
                                        <button className="flex items-center gap-1 hover:text-indigo-600">
                                            External <ChevronDown className="w-3 h-3" />
                                        </button>
                                        <div className="hidden group-hover:block absolute left-0 top-full mt-1 bg-white border border-gray-100 shadow-lg rounded-lg z-10 min-w-[120px] p-1">
                                            <button onClick={() => setExternalView('total')} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded text-gray-700">Total</button>
                                            <button onClick={() => setExternalView('semester_external')} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded text-gray-700">Semester</button>
                                            <button onClick={() => setExternalView('lab_external')} className="w-full text-left px-3 py-1.5 hover:bg-gray-50 rounded text-gray-700">Labs</button>
                                        </div>
                                    </div>
                                    {externalView !== 'total' && <span className="text-xs text-indigo-500 block font-normal capitalize">{externalView === 'semester_external' ? 'Sem' : 'Labs'}</span>}
                                </th>
                                <th className="py-3 px-4 font-semibold text-right">Total</th>
                                <th className="py-3 px-4 font-semibold text-center">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMarks.map((m, i) => {
                                let internalDisplay = m.internal;
                                if (internalView === 'mid1') internalDisplay = m.mid1 || 0;
                                if (internalView === 'mid2') internalDisplay = m.mid2 || 0;
                                if (internalView === 'lab_internal') internalDisplay = m.lab_internal || 0;

                                let externalDisplay = m.external;
                                if (externalView === 'semester_external') externalDisplay = m.semester_external || 0;
                                if (externalView === 'lab_external') externalDisplay = m.lab_external || 0;

                                return (
                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-800">{m.subject}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                                <span className={`px-1.5 py-0.5 rounded ${m.subjectType === 'lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {m.subjectType === 'lab' ? 'LAB' : 'THEORY'}
                                                </span>
                                                <span>• {m.credits} Credits</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{internalDisplay}</td>
                                        <td className="py-3 px-4 text-gray-600">{externalDisplay}</td>
                                        <td className="py-3 px-4 text-right font-bold text-gray-800">{m.total}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`inline-block w-8 py-0.5 rounded text-xs font-bold ${m.grade === 'F' ? 'bg-red-100 text-red-600' :
                                                m.grade === 'O' ? 'bg-purple-100 text-purple-700' :
                                                    m.grade === 'A+' || m.grade === 'A' ? 'bg-green-100 text-green-700' :
                                                        m.grade === 'B+' || m.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {m.grade}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredMarks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-400">
                                        No marks available for this semester.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { updateTimetableSlot, TimetableEntry } from "@/actions/timetable";
import { Clock, BookOpen, Users, AlertCircle, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Types
type AssignedMeta = {
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    batchId: string;
    semester: string; // We'll infer this for now
};

const PERIODS = [
    { id: 1, time: "09:30 - 10:20" },
    { id: 2, time: "10:20 - 11:10" },
    { id: 3, time: "11:30 - 12:20" },
    { id: 4, time: "12:20 - 01:10" },
    { id: 5, time: "02:00 - 02:50" },
    { id: 6, time: "02:50 - 03:40" },
    { id: 7, time: "03:40 - 04:30" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function FacultyTimetable({
    facultyId,
    initialTimetable,
    assignments
}: {
    facultyId: string;
    initialTimetable: TimetableEntry[];
    assignments: AssignedMeta[];
}) {
    const [selectedDay, setSelectedDay] = useState("Monday");
    const [timetable, setTimetable] = useState(initialTimetable);
    const [isEditing, setIsEditing] = useState<{ period: number; entry?: TimetableEntry } | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Sync with server data on refresh
    useEffect(() => {
        setTimetable(initialTimetable);
    }, [initialTimetable]);

    // Editor State
    const [editClassId, setEditClassId] = useState("");
    const [editSubjectId, setEditSubjectId] = useState("");

    const daySchedule = timetable.filter(t => t.dayOfWeek === selectedDay);

    const handleEditClick = (period: number) => {
        const entry = daySchedule.find(t => t.period === period);
        setIsEditing({ period, entry });
        if (entry) {
            setEditClassId(entry.classId);
            setEditSubjectId(entry.subjectId);
        } else {
            setEditClassId("");
            setEditSubjectId("");
        }
    };

    const handleSave = async () => {
        if (!isEditing) return;

        setLoading(true);

        // If classId and subjectId are empty strings, it means "Leisure" (Clear slot)
        // We don't need metadata for batch/semester in this case
        let meta: AssignedMeta | undefined;

        if (editClassId && editSubjectId) {
            // Find meta for batch/semester only if we are assigning something
            meta = assignments.find(a => a.subjectId === editSubjectId && a.classId === editClassId);

            if (!meta) {
                alert("Invalid assignment combination.");
                setLoading(false);
                return;
            }
        }

        const res = await updateTimetableSlot(facultyId, {
            dayOfWeek: selectedDay,
            period: isEditing.period,
            classId: editClassId || undefined,
            subjectId: editSubjectId || undefined,
            batchId: meta?.batchId || undefined,
            semester: meta?.semester || undefined
        });

        if (res.success) {
            router.refresh();
            setIsEditing(null);
        } else {
            alert("Failed to update: " + res.error);
        }
        setLoading(false);
    };

    // Derived unique list for dropdowns (filtering assignments)
    // Actually we restrict user to pick from their assignments

    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Left Sidebar: Days */}
            <div className="w-full md:w-48 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {DAYS.map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-4 py-3 rounded-xl text-left font-medium transition-all whitespace-nowrap ${selectedDay === day
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                            }`}
                    >
                        {day}
                        {/* Show count badge */}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${selectedDay === day ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                            {timetable.filter(t => t.dayOfWeek === day).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main Area: Periods */}
            <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{selectedDay}&apos;s Schedule</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {PERIODS.map((p) => {
                        const entry = daySchedule.find(t => t.period === p.id);

                        return (
                            <div key={p.id} onClick={() => handleEditClick(p.id)} className="cursor-pointer group relative">
                                <div className={`px-4 py-3 rounded-xl border transition-all h-[100px] flex flex-col justify-between ${entry
                                    ? "bg-indigo-50 border-indigo-100/50 shadow-sm"
                                    : "bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50"
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider ${entry ? "text-indigo-600" : "text-gray-400"}`}>
                                            Period {p.id}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium bg-gray-50/50 px-1.5 py-0.5 rounded-full">{p.time}</div>
                                    </div>

                                    {entry ? (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm leading-tight truncate" title={entry.subjectName}>
                                                {entry.subjectName}
                                            </h4>
                                            <p className="text-xs text-indigo-600/80 flex items-center gap-1 mt-0.5 font-medium">
                                                {entry.className}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full pb-2">
                                            <span className="text-gray-300 text-xs font-medium group-hover:text-gray-400 transition-colors">Free</span>
                                        </div>
                                    )}

                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Edit2 className="text-gray-400 bg-white shadow-sm rounded-full p-1 hover:text-indigo-600" size={20} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit Modal / Overlay */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Edit Slot: {PERIODS.find(p => p.id === isEditing.period)?.time}</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "FREE") {
                                            setEditSubjectId("");
                                            setEditClassId("");
                                        } else {
                                            const [sId, cId] = val.split("|");
                                            setEditSubjectId(sId);
                                            setEditClassId(cId);
                                        }
                                    }}
                                    value={editClassId && editSubjectId ? `${editSubjectId}|${editClassId}` : "FREE"}
                                >
                                    <option value="FREE">Leisure / Free Period</option>
                                    {assignments.map((a, idx) => (
                                        <option key={idx} value={`${a.subjectId}|${a.classId}`}>
                                            {a.className} - {a.subjectName}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Select "Leisure" to clear the slot.</p>
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <button
                                    onClick={() => setIsEditing(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Schedule"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

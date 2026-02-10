"use client";

import { useState, useEffect } from "react";
import { updateTimetableSlot, TimetableEntry } from "@/actions/timetable";
import { Edit2, Clock, Calendar, Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AssignedMeta = {
    subjectId: string;
    subjectName: string;
    classId: string;
    className: string;
    batchId: string;
    semester: string;
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

export default function TimetableEditor({
    facultyId,
    initialTimetable,
    assignments
}: {
    facultyId: string;
    initialTimetable: TimetableEntry[];
    assignments: AssignedMeta[];
}) {
    const [timetable, setTimetable] = useState(initialTimetable);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string, period: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Sync with server data on refresh
    useEffect(() => {
        setTimetable(initialTimetable);
    }, [initialTimetable]);

    // Editor State
    const [selectedAssignment, setSelectedAssignment] = useState<string>(""); // "subjectId|classId"

    const handleSlotClick = (day: string, period: number) => {
        const entry = timetable.find(t => t.dayOfWeek === day && t.period === period);
        setSelectedSlot({ day, period });
        if (entry) {
            setSelectedAssignment(`${entry.subjectId}|${entry.classId}`);
        } else {
            setSelectedAssignment("");
        }
    };

    const handleSave = async () => {
        if (!selectedSlot) return;

        setLoading(true);

        if (!selectedAssignment) {
            // How to handle clearing? We need a delete action or update with null?
            // The current updateTimetableSlot upserts. If we send null subjectId?
            // Schema allows null subjectId for free periods?
            // Schema: subjectId: text("subject_id").references(() => subjects.id), // Nullable
            // Let's assume sending a special "free" update works or we might need a delete function.
            // For now, let's implement validation against selecting nothing if it was previously set.
            // Actually, better to implement "Free Period" as a valid option that clears the slot.
            // But updateTimetableSlot expects subjectId and classId.
            // If clearing, we might not have classId.
            // Let's implement basics: Only assigning classes.
            toast.error("Please select a class assignment");
            setLoading(false);
            return;
        }

        const [sId, cId] = selectedAssignment.split("|");
        const meta = assignments.find(a => a.subjectId === sId && a.classId === cId);

        if (!meta) {
            toast.error("Invalid assignment selected");
            setLoading(false);
            return;
        }

        const res = await updateTimetableSlot(facultyId, {
            dayOfWeek: selectedSlot.day,
            period: selectedSlot.period,
            classId: cId,
            subjectId: sId,
            batchId: meta.batchId,
            semester: meta.semester
        });

        if (res.success) {
            toast.success("Schedule updated");
            router.refresh();
            // Optimistic update locally?
            const updatedEntry: TimetableEntry = {
                id: "temp", // or find real one
                dayOfWeek: selectedSlot.day,
                period: selectedSlot.period,
                subjectId: sId,
                classId: cId,
                batchId: meta.batchId,
                semester: meta.semester,
                subjectName: meta.subjectName,
                className: meta.className
            };

            setTimetable(prev => {
                // Remove existing
                const filtered = prev.filter(t => !(t.dayOfWeek === selectedSlot.day && t.period === selectedSlot.period));
                return [...filtered, updatedEntry];
            });
            setSelectedSlot(null);
        } else {
            toast.error(res.error || "Failed using update");
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="p-4 text-left font-semibold text-gray-600 w-32 sticky left-0 bg-gray-50">Day</th>
                            {PERIODS.map(p => (
                                <th key={p.id} className="p-4 text-center font-semibold text-gray-600 min-w-[140px]">
                                    <div className="flex flex-col items-center">
                                        <span className="text-gray-900">Period {p.id}</span>
                                        <span className="text-xs font-normal text-gray-400 mt-1 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                                            {p.time}
                                        </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {DAYS.map(day => (
                            <tr key={day} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-100">
                                    {day}
                                </td>
                                {PERIODS.map(period => {
                                    const entry = timetable.find(t => t.dayOfWeek === day && t.period === period.id);
                                    const isSelected = selectedSlot?.day === day && selectedSlot?.period === period.id;

                                    return (
                                        <td key={period.id} className="p-2 border-r border-gray-50 last:border-0 relative">
                                            <div
                                                onClick={() => handleSlotClick(day, period.id)}
                                                className={`
                                                    h-24 rounded-lg border-2 p-2 cursor-pointer transition-all flex flex-col justify-center items-center text-center gap-1 group
                                                    ${isSelected
                                                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 ring-offset-1 z-10"
                                                        : entry
                                                            ? "border-indigo-100 bg-indigo-50/30 hover:border-indigo-300 hover:shadow-md"
                                                            : "border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-400"
                                                    }
                                                `}
                                            >
                                                {isSelected ? (
                                                    <div className="w-full h-full flex flex-col justify-center items-center space-y-2 animate-in zoom-in-95 duration-200">
                                                        <select
                                                            className="w-full text-xs p-1.5 border border-indigo-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            value={selectedAssignment}
                                                            onChange={e => setSelectedAssignment(e.target.value)}
                                                            onClick={e => e.stopPropagation()}
                                                            autoFocus
                                                        >
                                                            <option value="">Select...</option>
                                                            {assignments.map((a, idx) => (
                                                                <option key={idx} value={`${a.subjectId}|${a.classId}`}>
                                                                    {a.className} - {a.subjectName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="flex gap-1 w-full justify-center">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleSave(); }}
                                                                disabled={loading || !selectedAssignment}
                                                                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                                            >
                                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedSlot(null); }}
                                                                className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : entry ? (
                                                    <>
                                                        <span className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight" title={entry.subjectName}>
                                                            {entry.subjectName}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                                                            {entry.className}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Edit2 className="w-4 h-4 text-gray-400 mb-1" />
                                                        <span className="text-[10px] font-medium">Assign</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

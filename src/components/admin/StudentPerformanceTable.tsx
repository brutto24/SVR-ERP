"use client";

import { useState } from "react";
import { updateStudentStats, deleteStudent, createStudent } from "@/actions/admin";
import { Trash2, Save, X, Plus, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

type Student = {
    id: string;
    name: string;
    rollNo: string;
    attendancePercentage: number | null;
    cgpa: string | null;
    sgpa: string | null;
    classId: string;
};

export default function StudentPerformanceTable({
    initialStudents,
    classId,
    batchId
}: {
    initialStudents: Student[];
    classId: string;
    batchId: string; // Needed for creating students
}) {
    const [students, setStudents] = useState(initialStudents);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{ attendance: string; cgpa: string; sgpa: string }>({
        attendance: "",
        cgpa: "",
        sgpa: ""
    });

    // New Student State
    const [isAdding, setIsAdding] = useState(false);
    const [newStudent, setNewStudent] = useState({ name: "", registerNumber: "", email: "" });
    const router = useRouter();

    const handleEditClick = (stu: Student) => {
        setEditingId(stu.id);
        setEditForm({
            attendance: stu.attendancePercentage?.toString() || "0",
            cgpa: stu.cgpa || "0.0",
            sgpa: stu.sgpa || "0.0"
        });
    };

    const handleSave = async (studentId: string) => {
        // Optimistic update
        const updatedStudents = students.map(s =>
            s.id === studentId
                ? { ...s, attendancePercentage: parseInt(editForm.attendance), cgpa: editForm.cgpa, sgpa: editForm.sgpa }
                : s
        );
        setStudents(updatedStudents);
        setEditingId(null);

        // Server action
        await updateStudentStats(studentId, {
            attendance: parseInt(editForm.attendance),
            cgpa: editForm.cgpa,
            sgpa: editForm.sgpa
        });
        router.refresh();
    };

    const handleDelete = async (studentId: string) => {
        if (confirm("Are you sure you want to delete this student?")) {
            setStudents(students.filter(s => s.id !== studentId));
            await deleteStudent(studentId);
            router.refresh();
        }
    };

    const handleAddStudent = async () => {
        if (!newStudent.name || !newStudent.registerNumber) return;

        // Call server action to create student
        // Note: We need a batchId for creation. For now, we might need to pass it in or infer it.
        // Assuming we have batchId prop or we just pass a placeholder if not strictly enforced, 
        // but schema says batchId is NOT NULL. 
        // We will pass batchId from the parent component.

        const res = await createStudent({
            name: newStudent.name,
            // email removed as it is auto-generated in server action
            registerNumber: newStudent.registerNumber,
            batchId: batchId,
            classId: classId,
            currentSemester: "1-1" // Default
        });

        if (res.success) {
            setIsAdding(false);
            setNewStudent({ name: "", registerNumber: "", email: "" });
            router.refresh();
            // We can't easily optimistic update "create" without partial reload or returning the new ID
            // So we rely on router.refresh()
        } else {
            alert("Failed to create student: " + res.error);
        }
    };

    return (
        <div className="overflow-x-auto border rounded-xl border-gray-100">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-3 font-medium text-gray-500 w-32">Roll No</th>
                        <th className="px-6 py-3 font-medium text-gray-500">Name</th>
                        <th className="px-6 py-3 font-medium text-gray-500 w-24">Att. %</th>
                        <th className="px-6 py-3 font-medium text-gray-500 w-24">SGPA</th>
                        <th className="px-6 py-3 font-medium text-gray-500 w-24">CGPA</th>
                        <th className="px-6 py-3 font-medium text-gray-500 w-24 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                    {students.map((stu) => (
                        <tr key={stu.id} className="hover:bg-gray-50/50 group">
                            {editingId === stu.id ? (
                                <>
                                    <td className="px-6 py-3 font-mono text-gray-600">{stu.rollNo}</td>
                                    <td className="px-6 py-3 text-gray-900">{stu.name}</td>
                                    <td className="px-6 py-3">
                                        <div className="group/tooltip relative">
                                            <input
                                                type="number"
                                                className="w-16 border rounded px-1 py-0.5 text-gray-500 bg-gray-100 cursor-not-allowed"
                                                value={editForm.attendance}
                                                disabled
                                                title="Attendance is automatically calculated based on faculty records"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            className="w-16 border rounded px-1 py-0.5"
                                            value={editForm.sgpa}
                                            onChange={(e) => setEditForm({ ...editForm, sgpa: e.target.value })}
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input
                                            className="w-16 border rounded px-1 py-0.5"
                                            value={editForm.cgpa}
                                            onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleSave(stu.id)} className="text-green-600 hover:text-green-800 bg-green-50 p-1 rounded">
                                                <Save size={14} />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1 rounded">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="px-6 py-3 font-mono text-gray-600">{stu.rollNo}</td>
                                    <td className="px-6 py-3 text-gray-900">{stu.name}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(stu.attendancePercentage || 0) < 75 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            {stu.attendancePercentage || 0}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-gray-600">{stu.sgpa || "0.0"}</td>
                                    <td className="px-6 py-3 font-mono text-gray-600">{stu.cgpa || "0.0"}</td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditClick(stu)} className="text-indigo-600 hover:text-indigo-800">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(stu.id)} className="text-red-400 hover:text-red-600">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}

                    {/* Add New Row */}
                    {isAdding && (
                        <tr className="bg-indigo-50/50">
                            <td className="px-6 py-3">
                                <input
                                    className="w-full border rounded px-2 py-1 text-xs"
                                    placeholder="Roll No"
                                    value={newStudent.registerNumber}
                                    onChange={(e) => setNewStudent({ ...newStudent, registerNumber: e.target.value })}
                                />
                            </td>
                            <td className="px-6 py-3">
                                <input
                                    className="w-full border rounded px-2 py-1 text-xs"
                                    placeholder="Student Name"
                                    value={newStudent.name}
                                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                />
                            </td>
                            <td colSpan={3} className="px-6 py-3 text-xs text-gray-400 italic">
                                Performance stats can be added after saving.
                            </td>
                            <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={handleAddStudent} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">
                                        Save
                                    </button>
                                    <button onClick={() => setIsAdding(false)} className="px-2 py-1 text-gray-500 hover:text-gray-700">
                                        Cancel
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {!isAdding && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        <UserPlus size={16} />
                        Add Manually
                    </button>
                </div>
            )}
        </div>
    );
}

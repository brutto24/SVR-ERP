
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createStudent, deleteStudent, updateStudent } from "@/actions/admin";
import { Trash2, Plus, User, Edit2, Lock } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";

type StudentData = {
    id: string;
    userId: string;
    slug?: string;
    name: string;
    email?: string; // Add email to type if available, otherwise we might valid fetch it or pass it. 
    // Wait, the props 'students' might not have email if the select didn't include users table join fully or if it's flat.
    // Let's check page.tsx passing it. 
    // Assuming we might need to fetch it or it's passed. 
    // For now assuming it's available or we valid just use what we have. 
    // Actually, the page.tsx probably just passes student table data + user name. 
    // We might miss email. 
    registerNumber: string;
    currentSemester: string;
    attendancePercentage: number;
    user?: { email: string }; // Relations
};

export default function StudentManager({
    batchId,
    classId,
    students
}: {
    batchId: string;
    classId: string;
    students: any[]; // Relaxed type to accept the join result
}) {
    const router = useRouter();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        registerNumber: "",
        currentSemester: "1-1"
    });

    // Filter students based on search
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        const term = searchTerm.toLowerCase();
        return students.filter(stu =>
            (stu.user?.name || stu.name)?.toLowerCase().includes(term) ||
            stu.registerNumber?.toLowerCase().includes(term)
        );
    }, [students, searchTerm]);

    const handleEditClick = (stu: any) => {
        setEditingId(stu.id);
        setFormData({
            name: stu.user?.name || stu.name,
            registerNumber: stu.registerNumber,
            currentSemester: stu.currentSemester || "1-1"
        });
        setIsFormOpen(true);
    };

    const handleSubmit = async () => {
        const { name, registerNumber, currentSemester } = formData;
        if (!name || !registerNumber) {
            toast.error("Please fill all required fields");
            return;
        }

        let res;
        if (editingId) {
            res = await updateStudent(editingId, { name, registerNumber, currentSemester });
        } else {
            res = await createStudent({
                name,
                registerNumber,
                currentSemester,
                batchId,
                classId
            });
        }

        if (res.success) {
            setFormData({ name: "", registerNumber: "", currentSemester: "1-1" });
            setIsFormOpen(false);
            setEditingId(null);
            toast.success(editingId ? "Student updated successfully!" : "Student created successfully!");
            router.refresh();
        } else {
            toast.error(res.error || "Failed to save student");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete student ${name}?`)) {
            const res = await deleteStudent(id);
            if (res.success) {
                toast.success("Student deleted successfully");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to delete student");
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="text-sm text-gray-500 font-medium">
                    Total: {students.length} Students
                    {searchTerm && ` (${filteredStudents.length} filtered)`}
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: "", registerNumber: "", currentSemester: "1-1" });
                        setIsFormOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus size={18} /> Add Student
                </button>
            </div>

            {/* Search Bar */}
            <SearchBar
                placeholder="Search by name or ID..."
                onSearch={setSearchTerm}
                className="max-w-md"
            />

            {/* Create/Edit Form */}
            {isFormOpen && (
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold text-indigo-900 mb-4">{editingId ? "Edit Student" : "New Student Entry"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Student Name</label>
                            <input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Roll Number (ID)</label>
                            <input
                                value={formData.registerNumber}
                                onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                                className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. 23AI01"
                            />
                        </div>
                        {/* Email is now auto-generated based on ID */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase">Current Semester</label>
                            <select
                                value={formData.currentSemester}
                                onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                                className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="1-1">1-1</option>
                                <option value="1-2">1-2</option>
                                <option value="2-1">2-1</option>
                                <option value="2-2">2-2</option>
                                <option value="3-1">3-1</option>
                                <option value="3-2">3-2</option>
                                <option value="4-1">4-1</option>
                                <option value="4-2">4-2</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                            {editingId ? "Update Student" : "Add to Class"}
                        </button>
                    </div>
                </div>
            )}

            {/* List Table */}
            {filteredStudents.length === 0 ? (
                <EmptyState
                    icon={<User size={48} />}
                    title={searchTerm ? "No students found" : "No students yet"}
                    description={searchTerm ? `No students match "${searchTerm}". Try a different search term.` : "Get started by adding your first student to this class."}
                    action={!searchTerm ? {
                        label: "Add Student",
                        onClick: () => {
                            setEditingId(null);
                            setFormData({ name: "", registerNumber: "", currentSemester: "1-1" });
                            setIsFormOpen(true);
                        }
                    } : undefined}
                />
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-b-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Student ID (Roll No)</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-center">Attendance %</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.map((stu) => (
                                    <tr key={stu.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{stu.registerNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                                                    <User size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-700 font-medium">{stu.name || stu.user?.name}</span>
                                                    {/* Email hidden */}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${(stu.attendancePercentage || 0) >= 75 ? "bg-green-100 text-green-700" :
                                                (stu.attendancePercentage || 0) >= 65 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                {stu.attendancePercentage || 0}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Reset password for ${stu.name || stu.user?.name} to their ID?`)) {
                                                            const { adminResetPassword } = await import("@/actions/admin");
                                                            const res = await adminResetPassword(stu.id);
                                                            if (res.success) {
                                                                toast.success(`Password reset to ${stu.registerNumber}`);
                                                                router.refresh();
                                                            } else {
                                                                toast.error(res.error || "Failed to reset password");
                                                            }
                                                        }
                                                    }}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(stu)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Student"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(stu.id, stu.name || stu.user?.name)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

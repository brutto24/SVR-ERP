
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createStudent, deleteStudent, updateStudent } from "@/actions/admin";
import { Trash2, Plus, User, Edit2, Lock, Download } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/ui/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";

import { StudentDetailsModal } from "./StudentDetailsModal";

type StudentData = {
    id: string;
    userId: string;
    name: string;
    email?: string;
    isActive?: boolean;
    registerNumber: string;
    currentSemester: string;
    cgpa?: string;
    attendancePercentage?: number;
    user?: { email: string, name: string };

    // Context Info (Global Mode)
    batchId?: string;
    classId?: string;
    batchName?: string; // Optional for display
    className?: string; // Optional for display

    // New Fields
    mobileNumber?: string;
    parentName?: string;
    parentMobile?: string;
    address?: string;
    aadharNumber?: string;
    apaarId?: string;
};

export default function StudentManager({
    batchId,
    classId,
    students,
    canEdit,
    batches = [],
    classes = []
}: {
    batchId?: string;
    classId?: string;
    students: any[];
    canEdit?: boolean;
    batches?: { id: string; name: string }[];
    classes?: { id: string; name: string; batchId: string }[];
}) {
    const router = useRouter();
    const isGlobalMode = !batchId || !classId;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"students" | "info">("students");

    // Modal State
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        registerNumber: "",
        currentSemester: "1-1",
        batchId: batchId || "",
        classId: classId || "",
        mobileNumber: "",
        parentName: "",
        parentMobile: "",
        address: "",
        aadharNumber: "",
        apaarId: ""
    });

    // Derived State for Form
    const availableClasses = useMemo(() => {
        if (!formData.batchId) return [];
        return classes?.filter(c => c.batchId === formData.batchId) || [];
    }, [formData.batchId, classes]);

    // Filter students based on search
    const filteredStudents = useMemo(() => {
        if (!searchTerm) return students;
        const term = searchTerm.toLowerCase();
        return students.filter(stu =>
            (stu.user?.name || stu.name)?.toLowerCase().includes(term) ||
            stu.registerNumber?.toLowerCase().includes(term)
        );
    }, [students, searchTerm]);

    // Export Helpers
    const downloadCSV = (headers: string[], data: string[][], filename: string) => {
        const csvContent = [
            headers.join(","),
            ...data.map(row => row.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportStudentData = () => {
        const headers = [
            "Student ID", "Student Name",
            ...(isGlobalMode ? ["Batch", "Class"] : []),
            "Mobile Number",
            "Parent Name", "Parent Mobile", "Address",
            "Aadhar Number", "APAAR ID", "Current Semester", "CGPA"
        ];

        const data = students.map(s => [
            s.registerNumber,
            `"${s.user?.name || s.name}"`,
            ...(isGlobalMode ? [s.batchName || "-", s.className || "-"] : []),
            s.mobileNumber || "",
            s.parentName || "",
            s.parentMobile || "",
            `"${s.address || ""}"`,
            s.aadharNumber || "",
            s.apaarId || "",
            s.currentSemester,
            s.cgpa || ""
        ]);

        downloadCSV(headers, data, `StudentDetails-${isGlobalMode ? 'Global' : `Class-${classId}`}.csv`);
    };

    const handleEditClick = (e: React.MouseEvent, stu: any) => {
        e.stopPropagation(); // Prevent row click
        setEditingId(stu.id);
        setFormData({
            name: stu.user?.name || stu.name,
            registerNumber: stu.registerNumber,
            currentSemester: stu.currentSemester || "1-1",
            batchId: stu.batchId || batchId || "",
            classId: stu.classId || classId || "",
            mobileNumber: stu.mobileNumber || "",
            parentName: stu.parentName || "",
            parentMobile: stu.parentMobile || "",
            address: stu.address || "",
            aadharNumber: stu.aadharNumber || "",
            apaarId: stu.apaarId || ""
        });
        setIsFormOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation(); // Prevent row click
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

    const handleResetPassword = async (e: React.MouseEvent, stu: any) => {
        e.stopPropagation(); // Prevent row click
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
    };

    const handleSubmit = async () => {
        const { name, registerNumber, currentSemester, batchId: selectedBatchId, classId: selectedClassId, mobileNumber, parentName, parentMobile, address, aadharNumber, apaarId } = formData;

        if (!name || !registerNumber) {
            toast.error("Please fill Name and ID");
            return;
        }

        // Validate Batch/Class if in Global Mode or if they are editable
        const finalBatchId = selectedBatchId || batchId;
        const finalClassId = selectedClassId || classId;

        if (!finalBatchId || !finalClassId) {
            toast.error("Please select Batch and Class");
            return;
        }

        let res;
        if (editingId) {
            res = await updateStudent(editingId, {
                name,
                registerNumber,
                currentSemester,
                mobileNumber,
                parentName,
                parentMobile,
                address,
                aadharNumber,
                apaarId
            });
        } else {
            res = await createStudent({
                name,
                registerNumber,
                currentSemester,
                batchId: finalBatchId,
                classId: finalClassId,
                mobileNumber,
                parentName,
                parentMobile,
                address,
                aadharNumber,
                apaarId
            });
        }

        if (res.success) {
            setFormData({
                name: "",
                registerNumber: "",
                currentSemester: "1-1",
                batchId: batchId || "",
                classId: classId || "",
                mobileNumber: "",
                parentName: "",
                parentMobile: "",
                address: "",
                aadharNumber: "",
                apaarId: ""
            });
            setIsFormOpen(false);
            setEditingId(null);
            toast.success(editingId ? "Student updated successfully!" : "Student created successfully!");
            router.refresh();
        } else {
            toast.error(res.error || "Failed to save student");
        }
    };

    return (
        <div className="space-y-6">
            <StudentDetailsModal
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                student={selectedStudent}
            />

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 font-medium">
                        Total: {students.length} Students
                        {searchTerm && ` (${filteredStudents.length} filtered)`}
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("students")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "students"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setViewMode("info")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === "info"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                        >
                            Student Info
                        </button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExportStudentData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <Download size={18} /> Export Data
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    name: "",
                                    registerNumber: "",
                                    currentSemester: "1-1",
                                    batchId: batchId || "",
                                    classId: classId || "",
                                    mobileNumber: "",
                                    parentName: "",
                                    parentMobile: "",
                                    address: "",
                                    aadharNumber: "",
                                    apaarId: ""
                                });
                                setIsFormOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus size={18} /> Add Student
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <SearchBar
                placeholder="Search by name or ID..."
                onSearch={setSearchTerm}
                className="max-w-md"
            />

            {/* Create/Edit Form */}
            {
                isFormOpen && (
                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
                        <h3 className="font-semibold text-indigo-900 mb-4">{editingId ? "Edit Student" : "New Student Entry"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {/* Batch & Class Selection (Only if Global Mode or Creating New) */}
                            {(isGlobalMode && !editingId) && (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Batch</label>
                                        <select
                                            value={formData.batchId}
                                            onChange={(e) => setFormData({ ...formData, batchId: e.target.value, classId: "" })}
                                            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="">Select Batch</option>
                                            {batches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Class</label>
                                        <select
                                            value={formData.classId}
                                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                            className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            disabled={!formData.batchId}
                                        >
                                            <option value="">Select Class</option>
                                            {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

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
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Student Mobile</label>
                                <input
                                    value={formData.mobileNumber}
                                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. 9876543210"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Parent Name</label>
                                <input
                                    value={formData.parentName}
                                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Parent's Name"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Parent Mobile</label>
                                <input
                                    value={formData.parentMobile}
                                    onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Parent's Mobile"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Aadhar Number</label>
                                <input
                                    value={formData.aadharNumber}
                                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Aadhar Number"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">APAAR ID</label>
                                <input
                                    value={formData.apaarId}
                                    onChange={(e) => setFormData({ ...formData, apaarId: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="APAAR ID"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Address</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                                    placeholder="Residential Address"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                                {editingId ? "Update Student" : "Add to Class"}
                            </button>
                        </div>
                    </div>
                )
            }

            {/* List Table */}
            {
                filteredStudents.length === 0 ? (
                    <EmptyState
                        icon={<User size={48} />}
                        title={searchTerm ? "No students found" : "No students yet"}
                        description={searchTerm ? `No students match "${searchTerm}". Try a different search term.` : "Get started by adding your first student to this class."}
                        action={canEdit && !searchTerm ? {
                            label: "Add Student",
                            onClick: () => {
                                setEditingId(null);
                                setFormData({
                                    name: "",
                                    registerNumber: "",
                                    currentSemester: "1-1",
                                    batchId: batchId || "",
                                    classId: classId || "",
                                    mobileNumber: "",
                                    parentName: "",
                                    parentMobile: "",
                                    address: "",
                                    aadharNumber: "",
                                    apaarId: ""
                                });
                                setIsFormOpen(true);
                            }
                        } : undefined}
                    />
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden border-b-0">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                            Student ID
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                            Student Name
                                        </th>
                                        <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                            Current Semester
                                        </th>
                                        {viewMode === "info" && (
                                            <>
                                                {isGlobalMode && (
                                                    <>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                            Batch
                                                        </th>
                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                            Class
                                                        </th>
                                                    </>
                                                )}
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                    Student Mobile
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                    Parent Name
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                    Parent Mobile
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                    Address
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                    Aadhar Number
                                                </th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                                    APAAR ID
                                                </th>
                                            </>
                                        )}
                                        <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border border-gray-300 whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.map((stu) => (
                                        <tr
                                            key={stu.id}
                                            onClick={() => setSelectedStudent(stu)}
                                            className="hover:bg-blue-50 transition-colors cursor-pointer text-sm"
                                        >
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-900 border border-gray-300 font-mono">
                                                {stu.registerNumber}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-900 border border-gray-300 font-medium">
                                                {stu.name || stu.user?.name}
                                            </td>
                                            <td className="px-3 py-2 whitespace-nowrap text-gray-900 border border-gray-300 text-center">
                                                {stu.currentSemester}
                                            </td>
                                            {viewMode === "info" && (
                                                <>
                                                    {isGlobalMode && (
                                                        <>
                                                            <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                                {stu.batchName || "-"}
                                                            </td>
                                                            <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                                {stu.className || "-"}
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                        {stu.mobileNumber || "-"}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                        {stu.parentName || "-"}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300">
                                                        {stu.parentMobile || "-"}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300 max-w-xs truncate" title={stu.address || ""}>
                                                        {stu.address || "-"}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300 font-mono">
                                                        {stu.aadharNumber || "-"}
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-gray-600 border border-gray-300 font-mono">
                                                        {stu.apaarId || "-"}
                                                    </td>
                                                </>
                                            )}
                                            <td className="px-3 py-2 whitespace-nowrap text-right border border-gray-300">
                                                <div className="flex items-center justify-end gap-1">
                                                    {canEdit && (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleResetPassword(e, stu)}
                                                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                                title="Reset Password"
                                                            >
                                                                <Lock size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleEditClick(e, stu)}
                                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                                title="Edit Student"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(e, stu.id, stu.name || stu.user?.name)}
                                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete Student"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

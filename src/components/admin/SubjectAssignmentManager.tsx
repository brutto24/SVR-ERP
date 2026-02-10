"use client";

import { useState } from "react";
import { assignSubjectToFaculty, removeFacultyAssignment, updateFacultyAssignment, createSubject } from "@/actions/admin";
import { Plus, X, Check, Trash2, Pencil, BookPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Subject = {
    id: string;
    name: string;
    code: string;
    semester?: string;
    batchId: string;
};

type Class = {
    id: string;
    name: string;
};

type Batch = {
    id: string;
    name: string;
};

type Assignment = {
    id: string;
    subjectId: string;
    classId: string;
    subjectName: string;
    className: string;
};

export default function SubjectAssignmentManager({
    facultyId,
    subjects,
    classes,
    batches,
    assignments
}: {
    facultyId: string;
    subjects: Subject[];
    classes: (Class & { batchId: string })[];
    batches: Batch[];
    assignments: Assignment[];
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [loading, setLoading] = useState(false);
    const [newSubjectData, setNewSubjectData] = useState({
        name: "",
        code: "",
        batchId: "",
        semester: "",
        credits: 3,
        type: "theory" as "theory" | "lab"
    });
    const router = useRouter();

    const semesters = ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];

    // Filter subjects based on Batch and Semester
    const filteredSubjects = subjects.filter(s => {
        if (selectedBatch && s.batchId !== selectedBatch) return false;
        if (selectedSemester && s.semester !== selectedSemester) return false;
        return true;
    });

    const handleAssign = async () => {
        if (!selectedSubject || !selectedClass) return;
        setLoading(true);

        let res: { success: boolean; error?: string };
        if (editingId) {
            res = await updateFacultyAssignment(editingId, selectedSubject, selectedClass);
        } else {
            res = await assignSubjectToFaculty(facultyId, selectedSubject, selectedClass);
        }

        setLoading(false);
        if (res.success) {
            setIsAdding(false);
            setEditingId(null);
            setSelectedSubject("");
            setSelectedClass("");
            toast.success(editingId ? "Assignment updated successfully" : "Subject assigned successfully");
            // Don't reset semester, might be adding multiple for same sem
            router.refresh();
        } else {
            toast.error(res.error || "Failed to save assignment");
        }
    };

    const handleCreateSubject = async () => {
        if (!newSubjectData.name || !newSubjectData.code || !newSubjectData.batchId || !newSubjectData.semester) {
            toast.error("Please fill all required fields");
            return;
        }
        setLoading(true);
        const res = await createSubject(newSubjectData);
        setLoading(false);

        if (res.success) {
            setIsCreatingSubject(false);
            // Auto select the new subject
            setSelectedSemester(newSubjectData.semester);
            setSelectedSubject(res.id);
            setNewSubjectData({ name: "", code: "", batchId: "", semester: "", credits: 3, type: "theory" });
            toast.success("Subject created successfully");
            router.refresh();
        } else {
            toast.error(res.error || "Failed to create subject");
        }
    };

    const handleEdit = (assignment: Assignment) => {
        setEditingId(assignment.id);

        // Find the subject to set the correct semester context
        const subject = subjects.find(s => s.id === assignment.subjectId);
        if (subject?.semester) {
            setSelectedSemester(subject.semester);
        }
        if (subject?.batchId) {
            setSelectedBatch(subject.batchId);
        }

        setSelectedSubject(assignment.subjectId);
        setSelectedClass(assignment.classId);
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setSelectedSubject("");
        setSelectedClass("");
        setSelectedSemester("");
        setSelectedBatch("");
        setIsCreatingSubject(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this subject assignment?")) return;
        setLoading(true);
        const res = await removeFacultyAssignment(id);
        setLoading(false);
        if (res.success) {
            router.refresh();
        } else {
            alert("Failed to remove: " + res.error);
        }
    };

    return (
        <div className="space-y-4">
            {assignments.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No subjects assigned yet.</p>
            ) : (
                <ul className="space-y-3">
                    {assignments.map((a, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:border-indigo-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm border border-gray-100">
                                    {a.className.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{a.subjectName}</p>
                                    <p className="text-xs text-gray-500">{a.className}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(a)}
                                    disabled={loading}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="Edit Assignment"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(a.id)}
                                    disabled={loading}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Remove Assignment"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!isAdding ? (
                <button
                    onClick={() => {
                        setEditingId(null);
                        setSelectedSubject("");
                        setSelectedClass("");
                        setSelectedSemester("");
                        setSelectedBatch("");
                        setIsAdding(true);
                    }}
                    className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline"
                >
                    <Plus size={16} /> Assign Subject to Class
                </button>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-indigo-100 animate-fade-in relative">
                    <button
                        onClick={handleCancel}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>

                    <h4 className="font-semibold text-gray-700 mb-3 text-sm">
                        {editingId ? "Edit Assignment" : "New Assignment"}
                    </h4>

                    {isCreatingSubject ? (
                        <div className="space-y-3 bg-white p-3 rounded border border-gray-200">
                            <h5 className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                                <BookPlus size={14} /> Create New Subject
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500">Name</label>
                                    <input
                                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. Adv. Mathematics"
                                        value={newSubjectData.name}
                                        onChange={e => setNewSubjectData({ ...newSubjectData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Code</label>
                                    <input
                                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. MAT-101"
                                        value={newSubjectData.code}
                                        onChange={e => setNewSubjectData({ ...newSubjectData, code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Batch</label>
                                    <select
                                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newSubjectData.batchId}
                                        onChange={e => setNewSubjectData({ ...newSubjectData, batchId: e.target.value })}
                                    >
                                        <option value="">Select Batch</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Semester</label>
                                    <select
                                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newSubjectData.semester}
                                        onChange={e => setNewSubjectData({ ...newSubjectData, semester: e.target.value })}
                                    >
                                        <option value="">Select Sem</option>
                                        {semesters.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Type</label>
                                    <select
                                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newSubjectData.type}
                                        onChange={e => setNewSubjectData({ ...newSubjectData, type: e.target.value as "theory" | "lab" })}
                                    >
                                        <option value="theory">Theory</option>
                                        <option value="lab">Lab</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">Credits</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newSubjectData.credits}
                                        onChange={e => setNewSubjectData({ ...newSubjectData, credits: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setIsCreatingSubject(false)}
                                    className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateSubject}
                                    disabled={loading}
                                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                >
                                    Create & Select
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Batch Filter</label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2 md:mb-0"
                                    value={selectedBatch}
                                    onChange={(e) => {
                                        setSelectedBatch(e.target.value);
                                        setSelectedSubject(""); // Reset subject
                                    }}
                                >
                                    <option value="">All Batches</option>
                                    {batches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Semester Filter</label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2 md:mb-0"
                                    value={selectedSemester}
                                    onChange={(e) => {
                                        setSelectedSemester(e.target.value);
                                        setSelectedSubject(""); // Reset subject
                                    }}
                                >
                                    <option value="">All Semesters</option>
                                    {semesters.map(sem => (
                                        <option key={sem as string} value={sem as string}>{sem}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-[2]">
                                <label className="block text-xs font-medium text-gray-500 mb-1 flex justify-between">
                                    Subject
                                    <span
                                        onClick={() => {
                                            if (selectedSemester) setNewSubjectData(prev => ({ ...prev, semester: selectedSemester }));
                                            if (selectedBatch) setNewSubjectData(prev => ({ ...prev, batchId: selectedBatch }));
                                            setIsCreatingSubject(true);
                                        }}
                                        className="text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5"
                                    >
                                        <Plus size={10} /> New
                                    </span>
                                </label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="">Select Subject...</option>
                                    {filteredSubjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Class</label>
                                <select
                                    className="w-full text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option value="">Select Class...</option>
                                    {classes
                                        .filter(c => !selectedBatch || c.batchId === selectedBatch)
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleAssign}
                                    disabled={loading || !selectedSubject || !selectedClass}
                                    className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <Check size={18} />
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

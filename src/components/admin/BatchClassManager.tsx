
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClass, deleteClass, updateClass } from "@/actions/admin";
import { Trash2, Edit2, Users, Plus } from "lucide-react";

type ClassItem = {
    id: string;
    name: string;
};

export default function BatchClassManager({ batchId, classes }: { batchId: string, classes: ClassItem[] }) {
    const router = useRouter();
    const [isCreating, setIsCreating] = useState(false);
    const [newItemName, setNewItemName] = useState("");

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");

    const handleCreate = async () => {
        if (!newItemName.trim()) return;
        const res = await createClass(newItemName, batchId);
        if (res.success) {
            setNewItemName("");
            setIsCreating(false);
            // No strict need to refresh if using router.refresh(), but revalidatePath in action handles logical data. 
            // router.refresh() updates client cache.
            router.refresh();
        } else {
            alert(res.error);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Delete Class "${name}"? Warning: This removes it globally from all batches.`)) {
            const res = await deleteClass(id);
            if (!res.success) alert(res.error);
        }
    };

    const handleUpdate = async () => {
        if (!editingId || !editName.trim()) return;
        await updateClass(editingId, editName);
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Classes / Sections</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> Add Class
                </button>
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="bg-indigo-50 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <input
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Class Name (e.g., Section A)"
                        className="flex-1 px-4 py-2 rounded border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                    <button onClick={() => setIsCreating(false)} className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded hover:bg-gray-50">Cancel</button>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {classes.map((cls) => (
                    <div key={cls.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
                        {editingId === cls.id ? (
                            <div className="space-y-2">
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full border p-1 rounded font-bold"
                                />
                                <div className="flex gap-2 justify-end text-xs">
                                    <button onClick={handleUpdate} className="text-green-600 font-bold">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-gray-500">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3 className="font-bold text-lg text-gray-800 mb-4">{cls.name}</h3>

                                <button
                                    onClick={() => router.push(`/admin/batches/${batchId}/classes/${cls.id}`)}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                                >
                                    <Users size={16} /> View Students
                                </button>

                                {/* Actions */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button
                                        onClick={() => { setEditingId(cls.id); setEditName(cls.name); }}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cls.id, cls.name)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

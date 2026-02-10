"use client";

import { useState, useEffect } from "react";
import { createBatch } from "@/actions/admin";
import { toast } from "sonner";

export default function CreateBatchForm() {
    const currentYear = new Date().getFullYear();
    // Default to at least 2020 or current year
    const initialStartYear = Math.max(2020, currentYear);

    const [name, setName] = useState("");
    const [startYear, setStartYear] = useState(initialStartYear);
    const [endYear, setEndYear] = useState(initialStartYear + 4);

    const handleStartYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            setStartYear(val);
            setEndYear(val + 4);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        const batchName = name.trim() || `${startYear}-${endYear}`;

        const result = await createBatch({
            name: batchName,
            startDate: new Date(startYear, 0, 1),
            endDate: new Date(endYear, 11, 31)
        });

        if (result.success) {
            // Reset form
            setName("");
            setStartYear(initialStartYear);
            setEndYear(initialStartYear + 4);
            // alert("Batch created successfully!");
            toast.success("Batch created successfully!");
        } else {
            // alert(result.error || "Failed to create batch");
            toast.error(result.error || "Failed to create batch");
        }
    };

    return (
        <form action={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-600">Batch Name</label>
                <input
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter Batch Name"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div className="w-32 space-y-2">
                <label className="text-sm font-medium text-gray-600">Start Year</label>
                <input
                    name="startYear"
                    type="number"
                    min="2020"
                    value={startYear}
                    onChange={handleStartYearChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div className="w-32 space-y-2">
                <label className="text-sm font-medium text-gray-600">End Year</label>
                <input
                    name="endYear"
                    type="number"
                    value={endYear}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed"
                />
            </div>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                Create Batch
            </button>
        </form>
    );
}

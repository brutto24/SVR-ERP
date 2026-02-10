"use client";

import { Download } from "lucide-react";
import { useState } from "react";

interface StudentAttendance {
    id: string;
    name: string;
    registerNumber: string;
    className: string;
    stats: {
        total: number;
        present: number;
    };
    percentage: number;
}

export default function AttendanceExportButton({ students, batchName }: { students: StudentAttendance[], batchName: string }) {
    const [downloading, setDownloading] = useState(false);

    const handleExport = () => {
        setDownloading(true);

        try {
            // Define CSV Headers
            const headers = ["Name", "Register Number", "Class", "Total Classes", "Classes Attended", "Attendance Percentage", "Status"];

            // Map data to CSV rows
            const rows = students.map(student => {
                const status = student.percentage >= 75 ? "Eligible" :
                    student.percentage >= 65 ? "Condonation" : "Detained";

                return [
                    student.name,
                    student.registerNumber,
                    student.className,
                    student.stats.total.toString(),
                    student.stats.present.toString(),
                    `${student.percentage}%`,
                    status
                ].map(cell => `"${cell}"`).join(","); // Quote and join
            });

            // Combine headers and rows
            const csvContent = [headers.join(","), ...rows].join("\n");

            // Create Blob and Download Link
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Attendance_${batchName.replace(/\s+/g, '_')}_${timestamp}.csv`;

            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export CSV");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50"
        >
            <Download className="w-4 h-4" />
            {downloading ? "Exporting..." : "Export CSV"}
        </button>
    );
}

import { X } from "lucide-react";

type StudentDetails = {
    id: string;
    name: string;
    email?: string;
    registerNumber: string;
    currentSemester: string;
    cgpa?: string;
    attendancePercentage?: number;
    isActive?: boolean;
    // New Fields
    mobileNumber?: string;
    parentName?: string;
    parentMobile?: string;
    address?: string;
    aadharNumber?: string;
    apaarId?: string;
};

export function StudentDetailsModal({
    isOpen,
    onClose,
    student
}: {
    isOpen: boolean;
    onClose: () => void;
    student: StudentDetails | null;
}) {
    if (!isOpen || !student) return null;

    // Determine initial for avatar
    const initial = student.name.charAt(0).toUpperCase();

    // Determine Status Color
    const isActive = student.isActive !== false; // Default true if undefined
    const statusColor = isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
    const statusText = isActive ? "ACTIVE" : "INACTIVE";

    // Attendance Color
    const attendance = student.attendancePercentage || 0;
    const attendanceColor = attendance >= 75 ? "text-green-600" : attendance >= 60 ? "text-yellow-600" : "text-red-600";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-none">
                    <h2 className="text-xl font-bold text-gray-800">Student Details</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col items-center overflow-y-auto flex-1">
                    {/* Profile Avatar */}
                    <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-4xl font-bold mb-4 shadow-inner flex-none">
                        {initial}
                    </div>

                    {/* Name */}
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{student.name}</h3>

                    {/* Status Badge */}
                    <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wider mb-8 ${statusColor}`}>
                        {statusText}
                    </span>

                    {/* Details Grid */}
                    <div className="w-full space-y-4">
                        {/* Student Info */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">Academic & Personal Info</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Register No</p>
                                    <p className="text-sm font-bold text-gray-800 break-all">{student.registerNumber}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Semester</p>
                                    <p className="text-sm font-bold text-gray-800">{student.currentSemester}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Attendance</p>
                                    <p className={`text-sm font-bold ${attendanceColor}`}>{attendance}%</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">CGPA</p>
                                    <p className="text-sm font-bold text-gray-800">{student.cgpa || "0.0"}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Student Mobile</p>
                                    <p className="text-sm font-bold text-gray-800">{student.mobileNumber || "N/A"}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Aadhar Number</p>
                                    <p className="text-sm font-bold text-gray-800 break-all">{student.aadharNumber || "N/A"}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">APAAR ID</p>
                                    <p className="text-sm font-bold text-gray-800 break-all">{student.apaarId || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Parent & Contact Info */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 border-b border-gray-200 pb-2">Parent & Contact Info</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-3 rounded-lg shadow-sm col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Parent's Name</p>
                                    <p className="text-sm font-bold text-gray-800">{student.parentName || "N/A"}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Parent's Mobile</p>
                                    <p className="text-sm font-bold text-gray-800">{student.parentMobile || "N/A"}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm col-span-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Address</p>
                                    <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap">{student.address || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-50 flex justify-end flex-none">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

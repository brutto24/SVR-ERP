"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, logoutFromAllDevices } from "@/actions/auth";
import { LayoutDashboard, CheckSquare, FileText, CalendarDays, Users, LogOut } from "lucide-react";

type ClassTeacherAssigment = {
    batchId: string;
    classId: string;
    batchName: string;
    className: string;
} | null;

export default function FacultySidebar({ classTeacherData }: { classTeacherData?: ClassTeacherAssigment }) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="space-y-6">
                <nav className="space-y-1">
                    <NavLink
                        href="/faculty"
                        label="Dashboard"
                        icon={<LayoutDashboard size={20} />}
                        active={isActive("/faculty")}
                    />
                    <NavLink
                        href="/faculty/timetable"
                        label="My Schedule"
                        icon={<CalendarDays size={20} />}
                        active={isActive("/faculty/timetable")}
                    />

                    {/* Class Teacher Section */}
                    {classTeacherData && (
                        <>
                            <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider px-3 flex items-center gap-2">
                                <span>Class Teacher ({classTeacherData.className})</span>
                                <div className="h-px bg-gray-100 flex-1"></div>
                            </div>
                            <NavLink
                                href="/faculty/my-class"
                                label="My Class"
                                icon={<Users size={20} />} // Changed icon from GraduationCap to Users
                                active={isActive("/faculty/my-class")}
                            />
                        </>
                    )}

                    <div className="pt-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider px-3 flex items-center gap-2">
                        <span>Academics</span>
                        <div className="h-px bg-gray-100 flex-1"></div>
                    </div>

                    <NavLink
                        href="/faculty/attendance"
                        label="Mark Attendance"
                        icon={<CheckSquare size={20} />}
                        active={isActive("/faculty/attendance")}
                    />
                    <NavLink
                        href="/faculty/marks"
                        label="Enter Marks"
                        icon={<FileText size={20} />}
                        active={isActive("/faculty/marks")}
                    />
                </nav>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-2">
                <button
                    onClick={async () => await logoutFromAllDevices()}
                    className="w-full px-4 py-2 text-sm text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors text-left flex items-center gap-2"
                >
                    <LogOut size={16} />
                    Logout from All Devices
                </button>
                <button
                    onClick={async () => await logout()}
                    className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left flex items-center gap-2"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${active
                    ? "bg-indigo-50 text-indigo-700 shadow-xs border-l-4 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent"
                }
            `}
        >
            <span className={`${active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"}`}>
                {icon}
            </span>
            {label}
        </Link>
    );
}

import { db } from "@/db";
import { users, students, faculty, academicBatches, subjects } from "@/db/schema";
import { count } from "drizzle-orm";
import { Users, GraduationCap, School, BookOpen, TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

async function DashboardStats() {
    // Parallel data fetching
    const [
        totalStudentsResult,
        totalFacultyResult,
        totalBatchesResult,
        totalSubjectsResult
    ] = await Promise.all([
        db.select({ count: count() }).from(students),
        db.select({ count: count() }).from(faculty),
        db.select({ count: count() }).from(academicBatches),
        db.select({ count: count() }).from(subjects)
    ]);

    const totalStudents = totalStudentsResult[0].count;
    const totalFaculty = totalFacultyResult[0].count;
    const totalBatches = totalBatchesResult[0].count;
    const totalSubjects = totalSubjectsResult[0].count;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Students"
                value={totalStudents.toLocaleString()}
                trend="Active"
                color="blue"
                icon={<Users className="w-6 h-6" />}
            />
            <StatCard
                title="Total Faculty"
                value={totalFaculty.toLocaleString()}
                trend="Active"
                color="indigo"
                icon={<GraduationCap className="w-6 h-6" />}
            />
            <StatCard
                title="Batches"
                value={totalBatches.toString()}
                trend="Running"
                color="purple"
                icon={<School className="w-6 h-6" />}
            />
            <StatCard
                title="Subjects"
                value={totalSubjects.toString()}
                trend="Total"
                color="pink"
                icon={<BookOpen className="w-6 h-6" />}
            />
        </div>
    );
}

export default async function AdminDashboard() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Academic Year 2023-2024</p>
                </div>
            </div>

            <Suspense fallback={<LoadingSpinner size="lg" text="Loading dashboard data..." />}>
                <DashboardStats />
            </Suspense>
        </div>
    );
}

function StatCard({ title, value, trend, color, icon }: {
    title: string;
    value: string;
    trend: string;
    color: string;
    icon: React.ReactNode;
}) {
    const colorClasses: Record<string, { bg: string; text: string; icon: string }> = {
        blue: {
            bg: "bg-blue-50",
            text: "text-blue-600",
            icon: "bg-blue-100 text-blue-600"
        },
        indigo: {
            bg: "bg-indigo-50",
            text: "text-indigo-600",
            icon: "bg-indigo-100 text-indigo-600"
        },
        purple: {
            bg: "bg-purple-50",
            text: "text-purple-600",
            icon: "bg-purple-100 text-purple-600"
        },
        pink: {
            bg: "bg-pink-50",
            text: "text-pink-600",
            icon: "bg-pink-100 text-pink-600"
        }
    };

    const colors = colorClasses[color];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colors.icon} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
                    {trend}
                </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        </div>
    );
}

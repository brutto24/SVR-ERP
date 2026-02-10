import { db } from "@/db";
import { academicBatches } from "@/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ArrowRight, Calendar, BarChart3, School } from "lucide-react";

// Force dynamic to ensure we get latest data
export const dynamic = "force-dynamic";

export default async function AdminMarksPage() {
    const batches = await db.select().from(academicBatches).orderBy(desc(academicBatches.startDate));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Marks Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">Select a batch to view student marks</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.length > 0 ? (
                    batches.map((batch) => (
                        <Link
                            key={batch.id}
                            href={`/admin/marks/${batch.id}`}
                            className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <BarChart3 className="text-indigo-600 w-5 h-5" />
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${batch.isActive
                                        ? "bg-green-50 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                                        }`}>
                                        {batch.isActive ? "Active" : "Archived"}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                    {batch.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(batch.startDate).getFullYear()} - {new Date(batch.endDate).getFullYear()}
                                </p>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 font-medium group-hover:bg-indigo-50/50 transition-colors">
                                <span className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-gray-400" />
                                    View Marks
                                </span>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full bg-white p-12 rounded-xl border border-gray-200 border-dashed text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <School className="text-gray-400 w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Batches Found</h3>
                        <p className="text-gray-500">Create a batch first to track marks.</p>
                        <Link href="/admin/batches" className="inline-block mt-4 text-indigo-600 font-medium hover:underline">
                            Go to Batches &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

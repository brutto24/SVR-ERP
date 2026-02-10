import { db } from "@/db";
import { academicBatches } from "@/db/schema";
import { createBatch } from "@/actions/admin";
import { revalidatePath } from "next/cache";
import BatchManager from "@/components/admin/BatchManager";
import CreateBatchForm from "@/components/admin/CreateBatchForm";

export default async function BatchesPage() {
    const batches = await db.select().from(academicBatches).execute();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Academic Batches</h1>
                    <p className="text-sm text-gray-500">Manage academic years and batches</p>
                </div>
            </div>

            {/* Create Batch Form */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Create New Batch</h2>
                <CreateBatchForm />
            </div>

            {/* Batches List */}
            <BatchManager batches={batches} />
        </div>
    );
}

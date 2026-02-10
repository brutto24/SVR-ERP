
import { db } from "@/db";
import { classes, academicBatches } from "@/db/schema";
import { eq } from "drizzle-orm";
import BatchClassManager from "@/components/admin/BatchClassManager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BatchDetailsPage(props: { params: Promise<{ batchId: string }> }) {
    const params = await props.params;
    const batch = await db.query.academicBatches.findFirst({
        where: eq(academicBatches.id, params.batchId)
    });

    if (!batch) return <div>Batch not found</div>;

    // Fetch classes specific to this batch
    const batchClasses = await db.select().from(classes).where(eq(classes.batchId, params.batchId)).execute();

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="text-gray-600" size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Batch: {batch.name}</h1>
                    <p className="text-sm text-gray-500">Manage Classes / Sections for this batch</p>
                </div>
            </div>

            {/* Client Component for Class List */}
            <BatchClassManager batchId={params.batchId} classes={batchClasses} />
        </div>
    );
}

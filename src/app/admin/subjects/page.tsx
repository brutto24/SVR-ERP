
import { db } from "@/db";
import { subjects, academicBatches } from "@/db/schema";
import SubjectManager from "@/components/admin/SubjectManager";
import { desc } from "drizzle-orm";

export default async function SubjectsPage() {
    const allSubjects = await db.select().from(subjects).orderBy(desc(subjects.name)); // Just sorting by name or created
    const allBatches = await db.select().from(academicBatches);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Subject Management</h1>
            <SubjectManager initialSubjects={allSubjects} batches={allBatches} />
        </div>
    );
}

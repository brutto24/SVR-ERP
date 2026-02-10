import { db } from "@/db";
import { classes } from "@/db/schema";
import { createClass } from "@/actions/admin";

export default async function ClassesPage() {
    const allClasses = await db.select().from(classes).execute();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Classes / Sections</h1>
                    <p className="text-sm text-gray-500">Manage class sections (A, B, C...)</p>
                </div>
            </div>

            {/* Create Class Form */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Create New Class</h2>
                <form action={async (formData) => {
                    "use server";
                    await createClass(formData.get("name") as string);
                }} className="flex gap-4 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-gray-600">Class Name (e.g., Section A)</label>
                        <input name="name" required placeholder="Section A" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                        Create Class
                    </button>
                </form>
            </div>

            {/* Classes List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {allClasses.map((cls) => (
                    <div key={cls.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
                        {/* Could add delete/edit buttons here later */}
                    </div>
                ))}
                {allClasses.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-400 italic">No classes found. Create one above.</div>
                )}
            </div>
        </div>
    );
}

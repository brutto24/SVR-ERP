
import { db } from "./src/db";
import { faculty, users } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking all faculty users...");

    const allFaculty = await db.select({
        facultyId: faculty.id,
        userId: faculty.userId,
        name: users.name,
        email: users.email,
        employeeId: faculty.employeeId
    })
        .from(faculty)
        .innerJoin(users, eq(faculty.userId, users.id))
        .execute();

    console.log(`Total Faculty: ${allFaculty.length}`);
    allFaculty.forEach(f => {
        console.log(`${f.name},${f.facultyId},${f.userId}`);
    });
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

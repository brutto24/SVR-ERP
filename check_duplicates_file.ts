
import { db } from "./src/db";
import { subjects } from "./src/db/schema";
import * as fs from 'fs/promises';

async function main() {
    const allSubjects = await db.select().from(subjects);

    await fs.writeFile('dup_output.json', JSON.stringify({ subjects: allSubjects }, null, 2));
    console.log("Done");
}

main().catch(console.error);

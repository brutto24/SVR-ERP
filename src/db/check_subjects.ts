
import { db } from "./index";
import { subjects } from "./schema";

async function main() {
    const all = await db.select().from(subjects);
    console.log("Total Subjects:", all.length);
    console.log(all.map(s => s.name));
    process.exit(0);
}
main();

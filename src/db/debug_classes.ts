
import "dotenv/config";
import { db } from "./index";
import { classes } from "./schema";

async function main() {
    const all = await db.select().from(classes);
    console.log("Classes Count:", all.length);
    console.log(all);
    process.exit(0);
}
main();

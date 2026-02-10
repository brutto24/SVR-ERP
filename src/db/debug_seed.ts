
import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";

async function main() {
    console.log("Start debug...");
    try {
        const u = await db.select().from(users).limit(1);
        console.log("Users:", u.length);
        console.log("Success");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
main();

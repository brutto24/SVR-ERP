import { db } from "./index";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function main() {
    console.log("Running migrations...");
    try {
        await migrate(db, { migrationsFolder: "./src/db/migrations" });
        console.log("Migrations complete!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed!", err);
        process.exit(1);
    }
}

main();

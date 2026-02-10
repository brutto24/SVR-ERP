const { Client } = require('pg');

// Use the 'postgres' default database to connect initially
// We need to strip the database name from the env var and replace it with 'postgres'
// OR just hardcode it since we know the structure from the user's input
// User's URL: postgresql://postgres:0852@localhost:5432/college_erp

const connectionString = "postgresql://postgres:0852@localhost:5432/postgres";

const client = new Client({
    connectionString: connectionString,
});

async function createDatabase() {
    try {
        await client.connect();
        console.log("Connected to 'postgres' database.");

        // Check if database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'college_erp'");
        if (res.rowCount === 0) {
            console.log("Database 'college_erp' does not exist. Creating...");
            await client.query('CREATE DATABASE college_erp');
            console.log("✅ Database 'college_erp' created successfully!");
        } else {
            console.log("ℹ️ Database 'college_erp' already exists.");
        }

    } catch (err) {
        console.error("Failed to create database:", err);
    } finally {
        await client.end();
    }
}

createDatabase();

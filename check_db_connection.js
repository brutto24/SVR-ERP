const { Client } = require('pg');

// Read .env manually since dotenv might be acting up
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split(/\r?\n/).forEach(line => {
        const [key, value] = line.split('=');
        if (key && value && !process.env[key]) {
            process.env[key.trim()] = value.trim();
        }
    });
} catch (e) {
    console.log("Could not read .env file, using existing environment variables.");
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkConnection() {
    console.log("Attempting to connect to PostgreSQL...");
    console.log("URL:", process.env.DATABASE_URL ? "Defined (Hidden)" : "Not Defined");

    try {
        await client.connect();
        console.log("✅ SUCCESS: Connected to PostgreSQL!");
        const res = await client.query('SELECT NOW()');
        console.log("DB Time:", res.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error("❌ ERROR: Could not connect to PostgreSQL.");
        console.error("Details:", err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error("\nPossible Causes:");
            console.error("1. PostgreSQL service is NOT running.");
            console.error("2. Port 5432 is blocked or incorrect.");
            console.error("3. The host 'localhost' is not resolving.");
        }
        process.exit(1);
    }
}

checkConnection();

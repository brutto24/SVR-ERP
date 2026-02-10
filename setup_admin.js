const { Client } = require('pg');
const { hash } = require('bcryptjs');

async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        // Hash password
        const hashedPassword = await hash("admin123", 10);
        const userId = "admin-user-" + Date.now(); // Simple ID

        const query = `
      INSERT INTO users (id, email, password, name, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (email) DO NOTHING;
    `;

        const values = [userId, "admin@svr.edu", hashedPassword, "System Admin", "admin", true];

        const res = await client.query(query, values);

        if (res.rowCount > 0) {
            console.log("Details: admin@svr.edu / admin123");
        } else {
            console.log("Admin user already exists.");
        }

    } catch (err) {
        console.error("Seeding failed", err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seed();

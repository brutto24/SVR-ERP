const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function check() {
    await client.connect();
    const res = await client.query("SELECT count(*) FROM faculty");
    console.log("Faculty count:", res.rows[0].count);

    const usersRes = await client.query("SELECT * FROM users WHERE role = 'faculty' LIMIT 1");
    if (usersRes.rows.length > 0) {
        console.log("Sample Faculty User:", usersRes.rows[0].email);
    } else {
        console.log("No users with role 'faculty' found.");
    }

    await client.end();
}
check();

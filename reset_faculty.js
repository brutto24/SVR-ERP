const { Client } = require('pg');
const { hash } = require('bcryptjs');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function reset() {
    await client.connect();
    const hashedPassword = await hash("password", 10);
    const email = "b.kiran@svr.edu";

    await client.query("UPDATE users SET password = $1 WHERE email = $2", [hashedPassword, email]);

    console.log(`Password for ${email} reset to 'password'`);
    await client.end();
}
reset();

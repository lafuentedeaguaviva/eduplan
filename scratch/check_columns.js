const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'pdcs'");
        console.log("Columnas de la tabla pdcs:", res.rows.map(r => r.column_name));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

run();

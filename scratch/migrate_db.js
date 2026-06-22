const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log("Conectado a la base de datos.");

        // 1. Intentar agregar el valor 'listo' al enum
        try {
            await client.query("ALTER TYPE pdc_revision_status ADD VALUE 'listo' BEFORE 'enviado'");
            console.log("Valor 'listo' añadido al enum pdc_revision_status.");
        } catch (e) {
            console.log("El valor 'listo' ya existía o no se pudo añadir (probablemente ya existe).");
        }

        // 2. Agregar columna booleana por si acaso (para mayor flexibilidad)
        try {
            await client.query("ALTER TABLE pdc_revisiones ADD COLUMN IF NOT EXISTS es_borrador BOOLEAN DEFAULT FALSE");
            console.log("Columna 'es_borrador' añadida a pdc_revisiones.");
        } catch (e) {
            console.log("La columna 'es_borrador' ya existía.");
        }

        console.log("Migración completada exitosamente.");
    } catch (err) {
        console.error("Error durante la migración:", err);
    } finally {
        await client.end();
    }
}

run();

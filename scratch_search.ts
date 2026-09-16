import { db } from './src/lib/database';

async function test() {
    console.log("Testing searchUsers...");
    const query = "test";
    const { data, error } = await db
        .from('perfiles')
        .select('id, nombres, apellidos, correo, monedas_disponibles, ultimo_plan_comprado')
        .or(`nombres.ilike.%${query}%,apellidos.ilike.%${query}%,correo.ilike.%${query}%`)
        .limit(10);
    
    console.log("Error:", error);
    console.log("Data:", data);
}

test();

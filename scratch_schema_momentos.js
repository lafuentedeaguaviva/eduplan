import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const client = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
    console.log("Checking joins for momentos...");
    const tables = ['practica', 'teoria', 'produccion', 'valoracion'];
    for (const t of tables) {
        const { data, error } = await client.from(t).select(`*, biblioteca_${t}(*)`).limit(1);
        if (error) {
            console.log(`Error table ${t}:`, error.message);
        } else {
            console.log(`Table ${t} relations:`, JSON.stringify(data[0] || {}, null, 2));
        }
    }
}

run().catch(console.error);

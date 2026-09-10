import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use SERVICE ROLE KEY to bypass RLS! If you only have anon, use anon, but it might be restricted by RLS.
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function countRows(table) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) console.log(`Error on ${table}:`, error);
    return count;
}

async function test() {
    console.log("Perfiles count:", await countRows('perfiles'));
    console.log("UEs count:", await countRows('unidades_educativas'));
    console.log("areas_trabajo count:", await countRows('areas_trabajo'));
    console.log("unidad_educativa_personal count:", await countRows('unidad_educativa_personal'));
    console.log("gestion_directores count:", await countRows('gestion_directores'));
    
    // Let's get the tables in public schema
    const { data: tables } = await supabase.rpc('get_tables_info'); // if this RPC exists
    
    // Also, if my previous areas_trabajo query returned teachers, why is the user saying "Hay mas docentes que no se ven"?
    // Let's just find the UE of the first director and see how many teachers are in areas_trabajo vs what they expect
}
test();

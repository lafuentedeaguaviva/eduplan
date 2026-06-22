import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const client = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
    const { data } = await client.from('pdcs_area_trabajo').select('criterios_evaluacion').limit(5);
    console.log("Criterios JSON:", JSON.stringify(data, null, 2));
}

run().catch(console.error);

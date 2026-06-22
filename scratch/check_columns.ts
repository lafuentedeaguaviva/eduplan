import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
// Use process.cwd() or proper path to load env
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function main() {
    const { data, error } = await supabase.from('planificacion_semanal').select('*').limit(1);
    console.log("COLUMNS:", data && data.length > 0 ? Object.keys(data[0]) : "No data, but query success.");
    if (error) console.error(error);
}
main();

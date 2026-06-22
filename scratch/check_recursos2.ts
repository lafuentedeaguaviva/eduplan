import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: wp } = await supabase.from('planificacion_semanal').select('id, recursos_fuentes_ia').order('created_at', { ascending: false }).limit(5);
    console.log("planificacion_semanal:");
    console.log(wp);
}

check();

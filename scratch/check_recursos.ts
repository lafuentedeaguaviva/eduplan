import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: pdc } = await supabase.from('pdcs').select('id').order('created_at', { ascending: false }).limit(1).single();
    if (!pdc) return console.log("No pdc");
    
    const { data: report } = await supabase.from('pdc_snapshot').select('*').eq('pdc_id', pdc.id).eq('version_type', 'ia').order('created_at', { ascending: false }).limit(1).single();
    
    if (report) {
        const area = report.data.areas[0];
        const sem = area.semanas[0];
        console.log("IA Snapshot Semana 1:");
        console.log("recursos_fuentes_ia:", sem.recursos_fuentes_ia);
        console.log("recursos_fuentes_original:", sem.recursos_fuentes_original);
    } else {
        console.log("No IA snapshot found.");
        
        // Let's check planificacion_semanal table
        const { data: wp } = await supabase.from('planificacion_semanal').select('id, recursos_fuentes_ia').limit(1);
        console.log("planificacion_semanal:", wp);
    }
}

check();

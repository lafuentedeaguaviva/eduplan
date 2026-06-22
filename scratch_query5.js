import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    // Buscar si hay CUALQUIER planificacion_semanal con datos
    const { data: cols } = await supabase.from('planificacion_semanal').select('id, pdc_area_trabajo_id, area_trabajo_id, momentos, practica').not('momentos', 'is', null).limit(2);
    console.log("Con momentos:", JSON.stringify(cols, null, 2));

    const { data: all } = await supabase.from('planificacion_semanal').select('id, pdc_area_trabajo_id, area_trabajo_id').limit(2);
    console.log("Cualquiera:", JSON.stringify(all, null, 2));
}

run();

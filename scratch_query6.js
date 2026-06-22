import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    // Buscar un pdc aprobado que tenga planificacion_semanal
    const { data: revisiones } = await supabase.from('pdc_revisiones').select('pdc_origen_id').eq('estado', 'aprobado');
    const pdcIds = Array.from(new Set(revisiones.map(r => r.pdc_origen_id)));
    
    if (pdcIds.length === 0) { console.log("No approved PDCs"); return; }
    
    const { data: pdcs } = await supabase
        .from('pdcs')
        .select(`
            id,
            pdcs_area_trabajo (
                id,
                planificacion_semanal (
                    id,
                    momentos,
                    momentos_ia,
                    practica (*),
                    teoria (*),
                    produccion (*),
                    valoracion (*)
                )
            )
        `)
        .in('id', pdcIds);
        
    console.log(JSON.stringify(pdcs, null, 2));
}

run();

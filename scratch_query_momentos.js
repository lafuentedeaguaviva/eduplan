import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data: revisiones } = await supabase
        .from('pdc_revisiones')
        .select('pdc_origen_id')
        .eq('estado', 'aprobado');
    
    if (!revisiones || revisiones.length === 0) {
        console.log("No revisiones aprobadas");
        return;
    }

    const pdcIds = Array.from(new Set(revisiones.map(r => r.pdc_origen_id)));
    
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
                    practica,
                    teoria,
                    produccion,
                    valoracion
                ),
                areas_trabajo (
                    planificacion_semanal (
                        id,
                        momentos,
                        momentos_ia,
                        practica,
                        teoria,
                        produccion,
                        valoracion
                    )
                )
            )
        `)
        .in('id', pdcIds);
        
    console.log(JSON.stringify(pdcs, null, 2));
}

run();

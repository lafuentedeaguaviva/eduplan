import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
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
        .limit(2);
        
    console.log(JSON.stringify(pdcs, null, 2));
}

run();

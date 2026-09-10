import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const unidadId = 81220075;
    const { data } = await supabase
        .from('areas_trabajo')
        .select(`
            nombre,
            profesor_id,
            perfiles!areas_trabajo_profesor_id_fkey (nombres, apellidos),
            area_trabajo_paralelo (paralelo_id, horario)
        `)
        .eq('unidad_educativa_id', unidadId);
    
    console.log(JSON.stringify(data, null, 2));
}
check();

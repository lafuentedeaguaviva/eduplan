import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function test() {
    const { data: director } = await supabase.from('gestion_directores').select('perfil_id, unidad_id').limit(1);
    
    if (director && director.length > 0) {
        const unidadId = director[0].unidad_id;
        console.log("Testing with UE:", unidadId);

        const { data, error } = await supabase
            .from('areas_trabajo')
            .select(`
                id,
                nombre,
                profesor_id,
                perfiles!areas_trabajo_profesor_id_fkey (
                    nombres,
                    apellidos,
                    foto_url
                ),
                area_trabajo_paralelo (
                    paralelo,
                    horario
                )
            `)
            .eq('unidad_educativa_id', unidadId);
            
        console.log("Horarios error:", error);
    }
}
test();

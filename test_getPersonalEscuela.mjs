import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function test() {
    // 1. Get first director
    const { data: director } = await supabase.from('gestion_directores').select('perfil_id, unidad_id').limit(1);
    console.log("Director:", director);

    if (director && director.length > 0) {
        const unidadId = director[0].unidad_id;
        
        // 2. Run the exact query from InstitucionalService.getPersonalEscuela
        const { data, error } = await supabase
            .from('areas_trabajo')
            .select(`
                profesor_id,
                perfiles!areas_trabajo_profesor_id_fkey (
                    id,
                    nombres,
                    apellidos,
                    email,
                    celular,
                    foto_url
                )
            `)
            .eq('unidad_educativa_id', unidadId);
            
        console.log("getPersonalEscuela data:", data);
        console.log("getPersonalEscuela error:", error);
    }
}
test();

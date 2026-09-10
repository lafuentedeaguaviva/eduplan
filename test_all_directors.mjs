import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function test() {
    // 1. Get all directors
    const { data: directores } = await supabase.from('gestion_directores').select(`
        perfil_id, 
        unidad_id,
        perfil:perfiles (nombres, apellidos),
        unidad:unidades_educativas (nombre)
    `);
    
    console.log("Todos los directores del sistema:", JSON.stringify(directores, null, 2));

    // 2. Also check if the teacher has any subjects in areas_trabajo_paralelo or something else
    const teacherId = '94fec9ed-15b5-4021-bb8c-60c127191145';
    const { data: areas } = await supabase.from('areas_trabajo').select(`
        id, 
        unidad_educativa_id, 
        area_conocimiento_id,
        unidad:unidades_educativas (nombre)
    `).eq('profesor_id', teacherId);
    
    console.log("Materia del profesor 94fec9ed:", JSON.stringify(areas, null, 2));
}
test();

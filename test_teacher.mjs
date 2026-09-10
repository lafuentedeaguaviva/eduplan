import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function test() {
    const teacherId = '94fec9ed-15b5-4021-bb8c-60c127191145';
    
    // 1. Check if the profile exists
    const { data: profile } = await supabase.from('perfiles').select('id, nombres, apellidos, rol').eq('id', teacherId).single();
    console.log("Teacher Profile:", profile);

    // 2. Check roles
    const { data: roles } = await supabase.from('perfil_roles').select('*').eq('perfil_id', teacherId);
    console.log("Teacher Roles:", roles);

    // 3. Check their areas of work
    const { data: areas } = await supabase.from('areas_trabajo').select('id, unidad_educativa_id, area_conocimiento_id').eq('profesor_id', teacherId);
    console.log("Teacher Areas de Trabajo:", areas);
    
    // 4. Check if they have PDCs
    const { count: pdcCount } = await supabase.from('pdcs').select('*', {count: 'exact', head: true}).eq('docente_id', teacherId);
    console.log("PDCs count:", pdcCount);
    
    // 5. Get current director unit
    const { data: director } = await supabase.from('gestion_directores').select('perfil_id, unidad_id').limit(1);
    console.log("Director:", director);
}
test();

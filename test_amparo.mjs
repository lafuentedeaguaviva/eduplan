import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const perfilId = 'f891aba6-5945-48d9-8a83-2cd0aebb87a5';
    
    const { data: ue1 } = await supabase.from('unidades_educativas').select('id, nombre').eq('director_id', perfilId);
    console.log("Unidades Educativas directas:", ue1);

    const { data: staff } = await supabase.from('unidad_educativa_personal').select('unidad_educativa_id').eq('perfil_id', perfilId);
    console.log("Unidad Educativa Personal:", staff);
    
    const { data: area } = await supabase.from('areas_trabajo').select('unidad_educativa_id').eq('profesor_id', perfilId);
    console.log("Areas de Trabajo (primera):", area);
    
    const { data: gestion } = await supabase.from('gestion_directores').select('unidad_id').eq('perfil_id', perfilId);
    console.log("Gestion Directores:", gestion);
}
test();

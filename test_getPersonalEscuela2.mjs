import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function test() {
    const unidadId = 81220075;
    console.log("Testing with UE:", unidadId);

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
        
    console.log("getPersonalEscuela data:", JSON.stringify(data, null, 2));
    console.log("getPersonalEscuela error:", error);
}
test();

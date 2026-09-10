import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const { data: areas, error } = await supabase.from('areas_trabajo')
        .select(`
            profesor_id,
            perfiles!areas_trabajo_profesor_id_fkey (id, nombres, apellidos, foto_url, email, rol)
        `)
        .limit(10);
    console.log("Teachers from areas_trabajo:", JSON.stringify(areas, null, 2), error);
}
test();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function test() {
    const { data: ues } = await supabase.from('unidades_educativas').select('id, nombre').in('id', [81220075, 81230196]);
    console.log("Unidades Educativas:", ues);
    
    // Let's get the proper profile name for this teacher without 'rol' column
    const teacherId = '94fec9ed-15b5-4021-bb8c-60c127191145';
    const { data: profile, error } = await supabase.from('perfiles').select('id, nombres, apellidos').eq('id', teacherId).single();
    console.log("Teacher Profile Name:", profile, error);
}
test();

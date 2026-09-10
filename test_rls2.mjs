import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// FORCE anon key
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function test() {
    const unidadId = 81220075;
    
    // Simulate query without service role
    const { data, error } = await supabase
        .from('areas_trabajo')
        .select('*')
        .eq('unidad_educativa_id', unidadId);
        
    console.log("Anon getPersonalEscuela data length:", data ? data.length : 0);
    console.log("Anon getPersonalEscuela error:", error);
}
test();

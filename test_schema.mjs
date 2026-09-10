import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    const { data: perfiles, error } = await supabase.from('perfiles').select('*').limit(1);
    console.log("Perfiles schema sample:", perfiles?.[0]);
    if (error) console.log("Error:", error);
}
test();

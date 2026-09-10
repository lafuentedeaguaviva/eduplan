import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    // Try to see if we have pg library installed in package.json
    console.log("We need to update RLS. Let's check if we can run SQL.");
    const { data, error } = await supabase.rpc('exec', { sql: 'SELECT 1;' });
    console.log("RPC exec:", error);
}
test();

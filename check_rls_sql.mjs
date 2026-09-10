import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
    const { data, error } = await supabase.from('areas_trabajo').select('*').limit(1);
    console.log("Check if we can query at all with service role:", data ? "yes" : "no");
    // Actually we can just write a pg_policies query and run it through psql if we have it.
    // Or let's create a server action / api route to do this operation!
}
test();

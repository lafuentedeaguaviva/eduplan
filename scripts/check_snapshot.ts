import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const db = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data, error } = await db
        .from('pdc_revisiones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
    
    if (error) {
        console.error("Error:", error);
        return;
    }
    console.log("Returned rows:", data?.length);
    if (data && data.length > 0) {
        console.log("Snapshot of first row:", JSON.stringify(data[0].pdc_snapshot, null, 2));
    }
}

main();

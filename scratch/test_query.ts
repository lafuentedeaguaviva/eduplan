import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const db = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await db.from('pdcs_area_trabajo')
        .select(`
            pdc_id,
            areas_trabajo (
                id
            ),
            planificacion_semanal (
                id
            )
        `)
        .limit(1);
    
    console.log("Error:", error);
    console.log("Data:", data);
}

test();

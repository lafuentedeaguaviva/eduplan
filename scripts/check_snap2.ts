import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const db = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data } = await db.from('pdc_revisiones').select('id, pdc_snapshot').order('created_at', { ascending: false }).limit(1);
    if (!data || data.length === 0) {
        console.log("No revisions found.");
        return;
    }
    const snap = data[0].pdc_snapshot;
    console.log("Found Revision ID:", data[0].id);
    console.log("Areas in snapshot:");
    snap.areas_trabajo.forEach((area: any) => {
        console.log("Area:", area.nombre);
        area.semanas.forEach((s: any) => {
            console.log(`  Semana ${s.semana}:`);
            console.log(`    momentos_ia: ${s.momentos_ia?.substring(0, 50)}...`);
            console.log(`    momentos_original: ${s.momentos_original?.substring(0, 50)}...`);
        });
    });
}
run();

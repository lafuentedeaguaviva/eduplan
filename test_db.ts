import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load the .env.local file from the eduplan-pro directory
dotenv.config({ path: path.resolve('d:/PDC/PDCOficial1/eduplan-pro/.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function test() {
    console.log("Fetching a pdcs_area_trabajo...");
    const { data: pat } = await supabase.from('pdcs_area_trabajo').select('id, area_trabajo_id').limit(1);
    console.log("PAT:", pat);
    
    console.log("Fetching planificacion_semanal...");
    const { data: plan } = await supabase.from('planificacion_semanal').select('id, area_trabajo_id, pdc_area_trabajo_id').limit(2);
    console.log("PLAN:", plan);
}

test();

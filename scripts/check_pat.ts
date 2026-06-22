import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPat() {
    const patId = '6dc1f919-5755-455b-9b92-3f538767877e';
    
    const { data: patData, error: patError } = await supabase
        .from('pdcs_area_trabajo')
        .select('*')
        .eq('id', patId)
        .single();
        
    console.log(`Junction data for patId ${patId}:`, patData);
    if (patData && patData.objetivo_estrategico) {
        console.log("Objetivo estratégico en PAT:", patData.objetivo_estrategico);
    } else {
        console.log("NO hay objetivo estratégico en la tabla PAT.");
    }

    if (patError) {
        console.error('Error:', patError);
    }
}

checkPat();

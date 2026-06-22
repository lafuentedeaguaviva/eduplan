import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJunction() {
    // Buscar todos los objetivos guardados para saber a qué pdc_area_trabajo_id pertenecen
    const { data: objData, error: objError } = await supabase
        .from('objetivo_estrategico')
        .select('*')
        .limit(10);
        
    console.log('Sample objectives in DB:', objData);

    if (objData && objData.length > 0) {
        // Tomar el primer objetivo y buscar a qué PDC y Área pertenece
        const patId = objData[0].pdc_area_trabajo_id;
        const { data: patData, error: patError } = await supabase
            .from('pdcs_area_trabajo')
            .select('*')
            .eq('id', patId);
            
        console.log(`Junction data for patId ${patId}:`, patData);
    }
}

checkJunction();

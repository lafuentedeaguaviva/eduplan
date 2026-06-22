const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: rev } = await supabase.from('pdc_revisiones').select('id, pdc_origen_id, nivel, pdc_snapshot').eq('id', '3c1e39a3-ddfb-4fe9-809b-5ea2a795f265').single();
    
    // Check how to query UE from PDC
    const { data: pdc } = await supabase.from('pdcs').select(`
        id,
        pdcs_area_trabajo (
            areas_trabajo ( unidad_educativa_id )
        )
    `).eq('id', rev.pdc_origen_id).single();
    
    console.log("PDC info:", JSON.stringify(pdc, null, 2));
    
    let ueId = null;
    if (pdc?.pdcs_area_trabajo?.length > 0) {
        ueId = pdc.pdcs_area_trabajo[0]?.areas_trabajo?.unidad_educativa_id;
    }
    console.log("UE ID:", ueId);
    console.log("Nivel:", rev.nivel);
    
    // Then find director
    let nivelKeyword = 'General';
    if (rev.nivel?.toLowerCase().includes('inicial')) nivelKeyword = 'Inicial';
    else if (rev.nivel?.toLowerCase().includes('primaria')) nivelKeyword = 'Primaria';
    else if (rev.nivel?.toLowerCase().includes('secundaria')) nivelKeyword = 'Secundaria';

    console.log("Searching for director with UE:", ueId, "and Nivel:", nivelKeyword);

    const { data: dirs, error } = await supabase.from('gestion_directores')
        .select('perfil_id, nivel')
        .eq('unidad_id', ueId)
        .in('nivel', [nivelKeyword, 'General']);
        
    console.log("Directors found:", dirs, error);
}
check();

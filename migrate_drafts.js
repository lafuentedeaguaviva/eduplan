const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("Fetching revisions...");
    const { data, error } = await supabase.from('pdc_revisiones').select('id, pdc_snapshot');
    if (error) {
        console.error("Error fetching:", error);
        return;
    }
    
    let updated = 0;
    for (let row of data) {
        if (!row.pdc_snapshot) continue;
        
        // Comprobar la vieja bandera
        const isDraft = row.pdc_snapshot._is_draft === true || row.pdc_snapshot._is_draft === 'true';
        
        // Quitar la bandera del JSON
        const newSnapshot = { ...row.pdc_snapshot };
        delete newSnapshot._is_draft;
        
        const pdc_estado = isDraft ? 'Borrador' : 'Finalizado';
        
        const { error: updateError } = await supabase
            .from('pdc_revisiones')
            .update({ pdc_estado, pdc_snapshot: newSnapshot })
            .eq('id', row.id);
            
        if (updateError) {
            console.error("Error updating ID:", row.id, updateError);
        } else {
            updated++;
        }
    }
    console.log(`Migration complete. Updated ${updated} rows.`);
}
migrate();

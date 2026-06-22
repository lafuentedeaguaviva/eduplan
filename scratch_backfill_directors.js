require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function backfill() {
    const { data: revisiones } = await supabase.from('pdc_revisiones').select('pdc_origen_id, director_id').not('director_id', 'is', null);
    
    console.log(`Found ${revisiones?.length || 0} revisions to backfill`);
    
    for (const rev of revisiones || []) {
        console.log(`Updating PDC ${rev.pdc_origen_id} with director ${rev.director_id}`);
        const { error } = await supabase.from('pdcs').update({ director_id: rev.director_id }).eq('id', rev.pdc_origen_id);
        if (error) {
            console.error(`Failed to update ${rev.pdc_origen_id}:`, error.message);
        }
    }
    console.log('Done');
}

backfill();

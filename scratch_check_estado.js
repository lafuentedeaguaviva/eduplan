const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkConstraint() {
  const { data, error } = await supabase
    .from('pdc_revisiones')
    .update({ estado: 'borrador' })
    .eq('id', '3c1e39a3-ddfb-4fe9-809b-5ea2a795f265')
    .select();
  console.log("UPDATE result:", data, error);
}

checkConstraint();

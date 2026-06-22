const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEstado() {
  const { data, error } = await supabase
    .from('pdc_revisiones')
    .update({ estado: 'borrador' })
    .eq('id', '3c1e39a3-ddfb-4fe9-809b-5ea2a795f265')
    .select();
  console.log("UPDATE result:", data, error);
}

checkEstado();

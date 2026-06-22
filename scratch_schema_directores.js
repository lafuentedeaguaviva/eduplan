const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data: gestion } = await supabase.from('gestion_directores').select('*').limit(1);
    console.log("Gestion directores sample:", gestion);
    
    const { data: ues } = await supabase.from('unidades_educativas').select('*').limit(1);
    console.log("UEs sample:", ues);
    
    const { data: niveles } = await supabase.from('niveles').select('*').limit(1);
    console.log("Niveles sample:", niveles);
}
checkSchema();

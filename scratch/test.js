require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
supabase.from('planificacion_semanal').select('id, semana, momentos').not('momentos', 'is', null).limit(2).then(res => console.log(JSON.stringify(res.data, null, 2)));

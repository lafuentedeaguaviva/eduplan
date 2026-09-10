import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data } = await supabase
        .from('areas_trabajo')
        .select(`
            id,
            nombre,
            profesor_id,
            area_trabajo_paralelo (paralelo_id, horario)
        `)
        .eq('profesor_id', '94fec9ed-15b5-4021-bb8c-60c127191145');
    
    console.log(JSON.stringify(data, null, 2));
}
check();

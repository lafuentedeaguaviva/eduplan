import { supabase } from './src/lib/supabase';

async function checkTable() {
    const { data, error } = await supabase.from('biblioteca_fuentes').select('*').limit(1);
    console.log('biblioteca_fuentes:', { data, error });
    
    const { data: data2, error: error2 } = await supabase.from('biblioteca_fuente').select('*').limit(1);
    console.log('biblioteca_fuente:', { data: data2, error: error2 });
}

checkTable();

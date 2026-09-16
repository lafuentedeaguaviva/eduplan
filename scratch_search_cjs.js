const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    console.log("Testing searchUsers...");
    const query = "test";
    
    const { data, error } = await db
        .from('perfiles')
        .select('id, nombres')
        .or(`nombres.ilike.%${query}%,apellidos.ilike.%${query}%,correo.ilike.%${query}%`)
        .limit(10);
    
    console.log("Error 1:", error);
    
    const { data: data2, error: error2 } = await db
        .from('perfiles')
        .select('id, nombres')
        .or(`nombres.ilike.*${query}*,apellidos.ilike.*${query}*,correo.ilike.*${query}*`)
        .limit(10);
        
    console.log("Error 2:", error2);
    
    const { data: data3, error: error3 } = await db
        .from('perfiles')
        .select('id, nombres')
        .or(`nombres.ilike."%${query}%",apellidos.ilike."%${query}%",correo.ilike."%${query}%"`)
        .limit(10);
        
    console.log("Error 3:", error3);
}

test();

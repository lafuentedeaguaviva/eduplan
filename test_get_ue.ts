import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const perfilId = 'f891aba6-5945-48d9-8a83-2cd0aebb87a5';

    // 1. Verificar si el usuario es Director en la tabla principal
    const { data: ueData, error: ueError } = await supabase
        .from('unidades_educativas')
        .select('id')
        .eq('director_id', perfilId)
        .single();
    
    console.log("ueData:", ueData, ueError);

    // 1.5 Verificar si el usuario es Director en gestion_directores
    const { data: dirData, error: dirError } = await supabase
        .from('gestion_directores')
        .select('unidad_id')
        .eq('perfil_id', perfilId)
        .limit(1)
        .single();
        
    console.log("dirData:", dirData, dirError);
}
run();

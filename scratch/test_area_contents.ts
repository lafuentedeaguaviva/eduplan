
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function getEnv() {
    const envPath = path.resolve('.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const env: any = {};
    content.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });
    return env;
}

const env = getEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function check() {
    const { data: themes, error: fetchError } = await supabase
        .from('contenidos_base')
        .select('*')
        .eq('id', 2208010000)
        .single();

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }
    
    console.log('Theme found:', themes);

    const areaId = themes.area_conocimiento_id;

    // Now find ALL contents for this area
    const { data: allContents } = await supabase
        .from('contenidos_base')
        .select('id, titulo, padre_id')
        .eq('area_conocimiento_id', areaId);
        
    console.log(`Total contents in base for area ${areaId}: ${allContents?.length}`);
    
    const parents = allContents?.filter(c => !c.padre_id) || [];
    const children = allContents?.filter(c => c.padre_id) || [];
    
    console.log(`Themes (padre_id null): ${parents.length}`);
    console.log(`Subthemes (padre_id not null): ${children.length}`);
    
    if (children.length === 0) {
        console.log('CRITICAL: This area has ZERO subthemes in the base curriculum!');
    }
}

check();


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
    console.log('Checking area_conocimiento_id for a specific subtheme...');
    const { data, error } = await supabase
        .from('contenidos_base')
        .select('id, titulo, padre_id, area_conocimiento_id')
        .eq('id', 1101010100)
        .single();
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Subtheme details:', data);
    }
}

check();

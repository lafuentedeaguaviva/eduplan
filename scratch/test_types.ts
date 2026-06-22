
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
    const { data, error } = await supabase
        .from('contenidos_usuario')
        .select('id, padre_id')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log('Row:', data[0]);
        console.log('Type of id:', typeof data[0].id);
        console.log('Type of padre_id:', typeof data[0].padre_id);
    } else {
        console.log('No rows found.');
    }
}

check();

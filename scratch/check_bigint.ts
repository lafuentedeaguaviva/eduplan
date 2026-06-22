
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
    console.log('Fetching a valid area_trabajo_id...');
    const { data: areas } = await supabase.from('areas_trabajo').select('id').limit(1);
    if (!areas || areas.length === 0) {
        console.error('No areas found or access denied');
        return;
    }
    const areaId = areas[0].id;
    
    console.log('Testing huge number on padre_id for area:', areaId);
    const { error } = await supabase
        .from('contenidos_usuario')
        .insert({
            area_trabajo_id: areaId,
            titulo: 'TEST BIGINT',
            padre_id: 999999999999 
        });
    
    if (error) {
        console.log('Insertion failed:', error.message);
        if (error.message.includes('out of range')) {
            console.log('CONFIRMED: padre_id is likely INT4 and not INT8');
        }
    } else {
        console.log('Inserted successfully with huge number. It is likely BIGINT.');
    }
}

check();

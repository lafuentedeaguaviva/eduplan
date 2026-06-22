
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
    console.log('Testing EXACT new logic...');
    
    const areaConocimientoId = 1101; 

    const { data: baseContents, error: fetchError } = await supabase
        .from('contenidos_base')
        .select('*')
        .eq('area_conocimiento_id', areaConocimientoId)
        .order('orden', { ascending: true })
        .order('id', { ascending: true });

    if (fetchError) {
        console.error('Fetch error:', fetchError);
        return;
    }
    
    let currentNextId = 1000;
    const idMap = new Map<string, number>();
    baseContents.forEach(c => {
        currentNextId++;
        idMap.set(String(c.id), currentNextId);
    });

    let nullPadreCount = 0;
    let mappedPadreCount = 0;

    const itemsToInsert = baseContents.map(c => {
        const newId = idMap.get(String(c.id));
        const basePadreId = (c.padre_id !== null && c.padre_id !== undefined) ? String(c.padre_id) : null;
        const userPadreId = basePadreId ? idMap.get(basePadreId) : null;

        if (basePadreId && !userPadreId) {
            console.log(`CRITICAL: Missing parent in map! Base content ${c.id} asks for parent ${basePadreId}`);
        }

        if (userPadreId) mappedPadreCount++;
        else nullPadreCount++;

        return {
            id: newId,
            origen_base_id: String(c.id),
            padre_id: userPadreId ? String(userPadreId) : null,
            titulo: c.titulo
        };
    });

    console.log(`Total mapped parents: ${mappedPadreCount}. Total null parents (Themes): ${nullPadreCount}`);
}

check();

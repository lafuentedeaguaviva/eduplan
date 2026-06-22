
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
    console.log('Testing ID mapping logic...');
    
    // Pick a known area_conocimiento_id that has themes and subthemes
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
    
    console.log(`Fetched ${baseContents.length} base contents.`);

    const parents = baseContents.filter(c => c.padre_id === null || c.padre_id === undefined);
    const children = baseContents.filter(c => c.padre_id !== null && c.padre_id !== undefined);
    const idMap = new Map<string, number>();

    console.log(`Parents: ${parents.length}, Children: ${children.length}`);

    let currentNextId = 1000;

    const parentsToInsert = parents.map((p, pIdx) => {
        currentNextId++;
        const newId = currentNextId;
        idMap.set(String(p.id), newId);
        return {
            id: newId,
            origen_base_id: String(p.id),
            titulo: p.titulo
        };
    });

    console.log(`Mapped ${idMap.size} parents to idMap.`);

    const childrenToInsert: any[] = [];
    let mappedChildrenCount = 0;
    let unmappedChildrenCount = 0;

    children.forEach(c => {
        const basePadreId = (c.padre_id !== null && c.padre_id !== undefined) ? String(c.padre_id) : null;
        const userPadreId = basePadreId ? idMap.get(basePadreId) : null;
        
        if (userPadreId) {
            currentNextId++;
            const newId = currentNextId;
            childrenToInsert.push({
                id: newId,
                origen_base_id: String(c.id),
                padre_id: String(userPadreId),
                titulo: c.titulo
            });
            mappedChildrenCount++;
        } else {
            console.log(`WARNING: Subtheme "${c.titulo}" (ID ${c.id}) has unmapped padre_id: ${basePadreId}`);
            unmappedChildrenCount++;
        }
    });

    console.log(`Successfully mapped ${mappedChildrenCount} children. Failed to map: ${unmappedChildrenCount}`);
    
    if (childrenToInsert.length > 0) {
        console.log('Sample children to insert:', childrenToInsert.slice(0, 3));
    }
}

check();

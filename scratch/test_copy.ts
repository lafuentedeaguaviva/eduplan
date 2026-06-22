
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

async function testCopy() {
    const areaId = '79119f12-70b5-498c-8f2e-065715560965'; // Example area from logs if available
    const baseId = 217; // Example subtheme ID
    
    console.log('Testing copy for baseId:', baseId);
    
    // 1. Fetch base
    const { data: baseContent } = await supabase
        .from('contenidos_base')
        .select('*')
        .eq('id', baseId)
        .single();
    
    console.log('Base content:', JSON.stringify(baseContent, null, 2));
    
    if (!baseContent.padre_id) {
        console.log('This is a theme, not a subtheme. Test a subtheme instead.');
        return;
    }
    
    // 2. Check if parent exists
    const { data: parentInUser } = await supabase
        .from('contenidos_usuario')
        .select('id')
        .eq('area_trabajo_id', areaId)
        .eq('origen_base_id', baseContent.padre_id)
        .single();
    
    console.log('Parent in user:', parentInUser);
    
    let userPadreId = parentInUser?.id || null;
    
    if (!userPadreId) {
        console.log('Parent not found, would copy parent first...');
        // Simulation of recursion
    }
    
    // 3. Try to insert child
    const insertData = {
        area_trabajo_id: areaId,
        origen_base_id: baseId,
        padre_id: userPadreId,
        titulo: baseContent.titulo + ' (TEST)',
        orden: baseContent.orden
    };
    
    console.log('Inserting child with:', JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
        .from('contenidos_usuario')
        .insert(insertData)
        .select()
        .single();
        
    if (error) {
        console.error('Insert error:', error);
    } else {
        console.log('Inserted row:', JSON.stringify(data, null, 2));
        if (data.padre_id === userPadreId) {
            console.log('SUCCESS: padre_id matches!');
        } else {
            console.log('FAILURE: padre_id does not match! Value in DB:', data.padre_id);
        }
    }
}

testCopy();

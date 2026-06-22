const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ggzmxejkcrajohzegxtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("--- Diagnóstico de contenidos_usuario ---");
    
    // 1. Cuántos contenidos hay en total
    const { count, error: countErr } = await supabase
        .from('contenidos_usuario')
        .select('*', { count: 'exact', head: true });
    console.log(`Total contenidos_usuario: ${count}`, countErr ? `Error: ${countErr.message}` : '');

    // 2. Contenidos por área (primeros 10 registros)
    const { data: cont, error: contErr } = await supabase
        .from('contenidos_usuario')
        .select('id, titulo, area_trabajo_id, padre_id')
        .limit(10);
    console.log("Muestra contenidos_usuario:", JSON.stringify(cont, null, 2), contErr ? `Error: ${contErr.message}` : '');

    // 3. Áreas de trabajo disponibles
    const { data: areas, error: areaErr } = await supabase
        .from('areas_trabajo')
        .select('id, area_conocimiento_id')
        .limit(5);
    console.log("areas_trabajo:", JSON.stringify(areas, null, 2), areaErr ? `Error: ${areaErr.message}` : '');

    // 4. PDCs existentes
    const { data: pdcs, error: pdcErr } = await supabase
        .from('pdcs')
        .select('id, nombre, trimestre, mes, gestion')
        .limit(5);
    console.log("pdcs:", JSON.stringify(pdcs, null, 2), pdcErr ? `Error: ${pdcErr.message}` : '');
}

check();

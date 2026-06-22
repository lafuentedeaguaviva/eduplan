const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ggzmxejkcrajohzegxtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log("--- Check DB ---");
    const { data: areas, error: areaErr } = await supabase.from('areas_trabajo').select('id, nombre').limit(5);
    console.log("areas_trabajo:", areas, areaErr);

    const { data: general, error: genErr } = await supabase.from('planificacion_semanal_general').select('*').limit(5);
    console.log("planificacion_semanal_general:", general, genErr);

    const { data: cont, error: contErr } = await supabase.from('contenidos_usuario').select('id, titulo, area_trabajo_id, padre_id').limit(5);
    console.log("contenidos_usuario:", cont, contErr);
}

check();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ggzmxejkcrajohzegxtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Querying planificacion_semanal...");
    const { data: plans, error: err1 } = await supabase
        .from('planificacion_semanal')
        .select(`
            id, area_trabajo_id, gestion, trimestre, mes, semana, pdc_area_trabajo_id
        `)
        .order('id', { ascending: false })
        .limit(10);

    if (err1) {
        console.error("Error plans:", err1);
    } else {
        console.log("Plans:", JSON.stringify(plans, null, 2));
    }

    console.log("Querying semana_contenido...");
    const { data: sc, error: err2 } = await supabase
        .from('semana_contenido')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);

    if (err2) {
        console.error("Error sc:", err2);
    } else {
        console.log("semana_contenido:", JSON.stringify(sc, null, 2));
    }
}

test();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ggzmxejkcrajohzegxtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLES = [
    'areas_trabajo', 'contenidos_usuario', 'pdcs', 'pdcs_area_trabajo',
    'planificacion_semanal', 'planificacion_semanal_general', 'semana_contenido',
    'unidades_educativas', 'areas_conocimiento', 'profesores', 'directores',
    'turnos', 'verbos', 'complementos', 'catalogos_verbos', 'catalogo_verbos',
    'catalogo_complementos', 'grados', 'niveles'
];

async function checkAll() {
    console.log("=== Estado de tablas en Supabase ===\n");
    for (const table of TABLES) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`${count > 0 ? '✅' : '⚪'} ${table}: ${count} registros`);
            }
        } catch (e) {
            console.log(`💥 ${table}: excepción - ${e.message}`);
        }
    }
}

checkAll();

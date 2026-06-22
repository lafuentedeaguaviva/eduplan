const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function testQuery() {
  const { data: revisiones } = await supabase.from('revisiones_pdc').select('pdc_id').eq('estado', 'aprobado');
  const pdcIds = revisiones.map(r => r.pdc_id);
  
  const { data: pdcs, error } = await supabase
    .from('pdcs')
    .select(`
        id,
        pdcs_area_trabajo (
            id,
            criterios_evaluacion,
            planificacion_semanal (
                id,
                momentos,
                momentos_ia,
                practica (*),
                teoria (*),
                produccion (*),
                valoracion (*)
            ),
            areas_trabajo (
                id,
                planificacion_semanal (
                    id,
                    momentos,
                    momentos_ia
                )
            ),
            objetivo_estrategico (descripcion, descripcion_ia)
        )
    `)
    .in('id', pdcIds);

  console.log(JSON.stringify(pdcs, null, 2));
}

testQuery();

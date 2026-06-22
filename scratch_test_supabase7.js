const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function testQuery() {
  const { data: revisiones } = await supabase.from('pdc_revisiones').select('pdc_origen_id').eq('estado', 'aprobado');
  const pdcIds = revisiones.map(r => r.pdc_origen_id);
  
  const { data: pdcs, error } = await supabase
    .from('pdcs')
    .select(`
        id,
        pdcs_area_trabajo (
            id,
            planificacion_semanal (
                id,
                momentos,
                momentos_ia,
                practica (*)
            )
        )
    `)
    .in('id', pdcIds);

  console.log("Error:", error);
  if (pdcs) {
     console.log(JSON.stringify(pdcs, null, 2));
  }
}

testQuery();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function testQuery() {
  const { data: revisiones, error: revError } = await supabase.from('revisiones_pdc').select('pdc_id').eq('estado', 'Aprobado');
  if (revError || !revisiones) {
      console.log('Error fetching revisiones:', revError);
      return;
  }
  
  console.log("Found approved PDCs:", revisiones.length);

  const pdcIds = revisiones.map(r => r.pdc_id);
  
  const { data: pdcs, error } = await supabase
    .from('pdcs')
    .select(`
        id,
        pdcs_area_trabajo (
            id,
            planificacion_semanal (
                id,
                momentos_ia
            ),
            areas_trabajo (
                id,
                planificacion_semanal (
                    id,
                    momentos_ia
                )
            )
        )
    `)
    .in('id', pdcIds);

  console.log(JSON.stringify(pdcs, null, 2));
}

testQuery();

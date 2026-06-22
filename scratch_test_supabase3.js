const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function testQuery() {
  const { data: revisiones } = await supabase.from('pdc_revisiones').select('pdc_origen_id').eq('estado', 'aprobado');
  if (!revisiones || revisiones.length === 0) return console.log('No approved PDCs');
  
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
                practica(id), teoria(id)
            ),
            areas_trabajo (
                id,
                planificacion_semanal (
                    id,
                    momentos,
                    momentos_ia,
                    practica(id), teoria(id)
                )
            )
        )
    `)
    .in('id', pdcIds);

  console.log("PDCs count:", pdcs.length);
  pdcs.forEach(pdc => {
    pdc.pdcs_area_trabajo.forEach(pat => {
      console.log('pat.planificacion_semanal:', pat.planificacion_semanal?.length);
      console.log('pat.areas_trabajo.planificacion_semanal:', pat.areas_trabajo?.planificacion_semanal?.length);
      if (pat.planificacion_semanal?.length > 0) {
        console.log('momentos_ia in PAT:', pat.planificacion_semanal[0].momentos_ia?.substring(0, 50));
      }
      if (pat.areas_trabajo?.planificacion_semanal?.length > 0) {
        console.log('momentos_ia in AT:', pat.areas_trabajo.planificacion_semanal[0].momentos_ia?.substring(0, 50));
      }
    });
  });
}

testQuery();

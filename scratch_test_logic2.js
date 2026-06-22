const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function debug() {
  const { data: revisiones } = await supabase.from('pdc_revisiones').select('pdc_origen_id').eq('estado', 'aprobado');
  const pdcIds = revisiones.map(r => r.pdc_origen_id);
  const { data: pdcs } = await supabase
    .from('pdcs')
    .select(`
        id,
        pdcs_area_trabajo (
            id,
            planificacion_semanal (
                id,
                momentos,
                momentos_ia
            ),
            areas_trabajo (
                id,
                planificacion_semanal (
                    id,
                    momentos,
                    momentos_ia
                )
            )
        )
    `)
    .in('id', pdcIds);

  const practicaCounts = new Map();
  
  const _incrementCounter = (map, key, defaultKey = 'Sin Tipo Específico') => {
      const finalKey = key || defaultKey;
      map.set(finalKey, (map.get(finalKey) || 0) + 1);
  };

  pdcs.forEach(pdc => {
      const pdcAreas = Array.isArray(pdc.pdcs_area_trabajo) ? pdc.pdcs_area_trabajo : (pdc.pdcs_area_trabajo ? [pdc.pdcs_area_trabajo] : []);
      pdcAreas.forEach(pat => {
          const areasTrabajo = Array.isArray(pat.areas_trabajo) ? pat.areas_trabajo : (pat.areas_trabajo ? [pat.areas_trabajo] : []);
          const patSemanas = Array.isArray(pat.planificacion_semanal) ? pat.planificacion_semanal : (pat.planificacion_semanal ? [pat.planificacion_semanal] : []);
          const atSemanas = areasTrabajo.flatMap(at => Array.isArray(at.planificacion_semanal) ? at.planificacion_semanal : []);
          const semanas = [...patSemanas, ...atSemanas];
          
          console.log(`PDC ${pdc.id} - PAT ${pat.id} - Semanas encontradas:`, semanas.length);

          semanas.forEach(sem => {
              let momentosArray = [];
              if (Array.isArray(sem.momentos)) {
                  momentosArray = sem.momentos;
              } else if (typeof sem.momentos === 'string') {
                  try { momentosArray = JSON.parse(sem.momentos); } catch(e) {}
              }

              if (momentosArray.length > 0) {
                  // normal
              } else if (sem.momentos_ia) {
                  const text = sem.momentos_ia.toLowerCase();
                  if (text.includes('práctica') || text.includes('practica')) {
                      _incrementCounter(practicaCounts, 'Práctica General', 'Práctica General');
                  }
              }
          });
      });
  });

  console.log('practicaCounts:', practicaCounts);
}
debug();

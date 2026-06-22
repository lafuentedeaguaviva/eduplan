const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function test() {
  const { data: directores } = await supabase
        .from('perfiles')
        .select('id, nombres, apellidos, rol')
        .ilike('nombres', '%juan%')
        .limit(10);
  
  console.log("JUAN PEREZ PROFILES:", JSON.stringify(directores, null, 2));

  const { data: unidad } = await supabase
        .from('unidades_educativas')
        .select('id, nombre, director_id')
        .eq('id', 72220077);
        
  console.log("UNIDAD EDUCATIVA DEL PDC ENVIADO:", JSON.stringify(unidad, null, 2));

  if (unidad && unidad[0] && unidad[0].director_id) {
      const { data: dir } = await supabase.from('perfiles').select('id, nombres, apellidos').eq('id', unidad[0].director_id);
      console.log("DIRECTOR ASIGNADO A ESA UNIDAD:", JSON.stringify(dir, null, 2));
  } else {
      console.log("ESTA UNIDAD NO TIENE DIRECTOR ASIGNADO!");
  }
}

test();

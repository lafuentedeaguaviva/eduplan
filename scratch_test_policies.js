const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function checkPolicies() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'planificacion_semanal' }).catch(() => ({}));
  if (error || !data) {
     // fallback: query pg_policies
     const { data: pols } = await supabase.from('pg_policies').select('*').eq('tablename', 'planificacion_semanal').catch(()=>({}));
     console.log("Policies:", pols);
  } else {
     console.log(data);
  }
}

checkPolicies();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ggzmxejkcrajohzegxtb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYxOTc3MCwiZXhwIjoyMDkyMTk1NzcwfQ.VWWOMISu6wOF_7tMRFZk2D-mlKnSX72n1zPHozVa_YE'
);

async function checkVerbos() {
  const { data, error } = await supabase
    .from('catalogo_verbos')
    .select('*')
    .limit(10);

  console.log("Verbos Data:", data);
  console.log("Error:", error);
}

checkVerbos();

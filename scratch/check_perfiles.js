const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ggzmxejkcrajohzegxtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPerfiles() {
    const { count, error } = await supabase.from('perfiles').select('*', { count: 'exact', head: true });
    console.log(`Perfiles visible to Anon: ${error ? 'ERROR (' + error.message + ')' : count}`);
}
checkPerfiles();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ggzmxejkcrajohzegxtb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE';
const db = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await db.from('configuracion_global').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();

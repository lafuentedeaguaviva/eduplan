import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJh...';

const db = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await db.from('planificacion_semanal').select('*').limit(1);
  console.log("Error:", error);
  console.log("Data keys:", data ? Object.keys(data[0]) : null);
  
  // also let's check adaptaciones_basicas table
  const { data: ad, error: adErr } = await db.from('adaptaciones_basicas').select('*').limit(1);
  console.log("Adaptaciones bas keys:", ad ? Object.keys(ad[0]) : null);
  console.log("Adaptaciones Data:", ad);
}

check();

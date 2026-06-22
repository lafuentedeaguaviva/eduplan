import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const db = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Querying pdcs_area_trabajo...");
  const { data: pdcsArea, error: err1 } = await db
    .from('pdcs_area_trabajo')
    .select('id, pdc_id, area_trabajo_id, objetivo_estrategico')
    .order('created_at', { ascending: false })
    .limit(5);

  if (err1) {
    console.error("Error fetching pdcs_area_trabajo:", err1);
  } else {
    console.log("Recent pdcs_area_trabajo:");
    console.dir(pdcsArea, { depth: null });
  }

  console.log("\nQuerying objetivo_estrategico...");
  const { data: objEstrategicos, error: err2 } = await db
    .from('objetivo_estrategico')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (err2) {
    console.error("Error fetching objetivo_estrategico:", err2);
  } else {
    console.log("Recent objetivo_estrategico:");
    console.dir(objEstrategicos, { depth: null });
  }
}

main();

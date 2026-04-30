const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('--- DB CONNECTION TEST ---');
  console.log('Target URL:', supabaseUrl);
  
  try {
    // 1. Verificamos la tabla perfiles y sus nuevas columnas
    const { data, error } = await supabase
      .from('perfiles')
      .select('id, solicitudes_ia_hoy, ultima_solicitud_ia')
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking perfiles:', error.message);
      if (error.message.includes('column solicitudes_ia_hoy does not exist')) {
        console.error('💡 La columna solicitudes_ia_hoy no existe. ¿Ejecutaste la migración completa?');
      }
    } else {
      console.log('✅ Connection to "perfiles": SUCCESS');
      console.log('✅ Columns "solicitudes_ia_hoy" and "ultima_solicitud_ia": VERIFIED');
    }

    // 2. Verificamos la tabla transacciones_credito
    const { error: error2 } = await supabase
      .from('transacciones_credito')
      .select('id')
      .limit(1);

    if (error2) {
      console.error('❌ Error checking "transacciones_credito":', error2.message);
      if (error2.code === '42P01') {
        console.error('💡 La tabla "transacciones_credito" no existe.');
      }
    } else {
      console.log('✅ Connection to "transacciones_credito": SUCCESS');
    }

    // 3. Verificamos planes de suscripción (catálogo básico)
    const { data: planes, error: error3 } = await supabase
      .from('planes_suscripcion')
      .select('nombre')
      .limit(3);

    if (error3) {
      console.error('❌ Error checking "planes_suscripcion":', error3.message);
    } else {
      console.log('✅ Connection to "planes_suscripcion": SUCCESS');
      console.log('📋 Plans found:', planes.map(p => p.nombre).join(', '));
    }

  } catch (err) {
    console.error('💥 Unexpected error during test:', err);
  }
}

test();

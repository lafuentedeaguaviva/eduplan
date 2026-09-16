const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    console.log("Testing getFinancialStats...");
    const res1 = await db.from('pagos_qr').select('monto_bob').eq('estado', 'Aprobado');
    console.log("pagos_qr error:", res1.error);
    const res2 = await db.from('ia_consumo_logs').select('total_tokens').eq('proveedor', 'deepseek');
    console.log("ia_consumo_logs error:", res2.error);
    const res3 = await db.from('historial_transacciones').select('monto_monedas').eq('tipo', 'Bono Demo');
    console.log("historial_transacciones error:", res3.error);
    
    console.log("Testing getConfig...");
    const res4 = await db.from('config_monetizacion').select('*').maybeSingle();
    console.log("config_monetizacion error:", res4.error);
    
    console.log("Testing getWhales...");
    const res5 = await db.from('perfiles').select('id, nombres, apellidos, email, monedas_disponibles, ultimo_plan_comprado').order('monedas_disponibles', { ascending: false }).limit(50);
    console.log("perfiles error:", res5.error);
    
    console.log("Testing getPendingPayments...");
    const res6 = await db.from('pagos_qr').select(`
                *,
                perfiles:perfil_id ( nombres, apellidos, email ),
                paquetes_monedas:paquete_id ( nombre, monedas_otorgadas )
            `).eq('estado', 'Pendiente').order('creado_en', { ascending: true });
    console.log("pagos_qr join error:", res6.error);
}

test();

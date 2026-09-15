import { NextResponse } from "next/server";
import { db } from "@/lib/database";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, pdcId, actionType, description } = body;

        if (!userId) {
            return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
        }

        // 1. Obtener Configuración de Costos
        const { data: config, error: configError } = await db.from('config_monetizacion').select('*').single();
        if (configError || !config) {
            return NextResponse.json({ success: false, error: "Error de configuración de monetización" }, { status: 500 });
        }

        let requiredCoins = 0;
        let finalDescription = description || "Gasto en IA";

        // 2. Determinar el costo
        if (actionType === 'pdc' && pdcId) {
            // Calcular basado en número de áreas
            const { data: areas, error: areaError } = await db
                .from('pdcs_area_trabajo')
                .select('id')
                .eq('pdc_id', pdcId);

            if (areaError) {
                return NextResponse.json({ success: false, error: "Error leyendo PDC" }, { status: 500 });
            }

            requiredCoins = (areas && areas.length > 1) ? config.costo_pdc_primaria : config.costo_pdc_secundaria;
            finalDescription = `Generación de PDC IA (${areas && areas.length > 1 ? 'Primaria/Inicial' : 'Secundaria'})`;
        } else if (actionType === 'examen') {
            requiredCoins = config.costo_examen;
            finalDescription = "Generación de Examen IA";
        } else if (actionType === 'autocompletar') {
            requiredCoins = config.costo_autocompletar;
            finalDescription = "Autocompletado IA";
        } else {
            return NextResponse.json({ success: false, error: "Invalid actionType" }, { status: 400 });
        }

        // 3. Verificar Saldo
        const { data: profile, error: profileError } = await db
            .from('perfiles')
            .select('monedas_disponibles')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ success: false, error: "Error leyendo perfil" }, { status: 500 });
        }

        const available = profile.monedas_disponibles || 0;

        if (available < requiredCoins) {
            return NextResponse.json({ 
                success: false, 
                error: "Saldo insuficiente", 
                required: requiredCoins, 
                available 
            }, { status: 402 }); // 402 Payment Required
        }

        // 4. Ejecutar Descuento y Registro (En un mundo ideal usaríamos RPC, pero aquí lo hacemos secuencial)
        const nuevoSaldo = available - requiredCoins;
        
        const { error: updateError } = await db
            .from('perfiles')
            .update({ monedas_disponibles: nuevoSaldo })
            .eq('id', userId);

        if (updateError) {
            return NextResponse.json({ success: false, error: "Error descontando monedas" }, { status: 500 });
        }

        // 5. Registrar Transacción
        await db.from('historial_transacciones').insert({
            perfil_id: userId,
            tipo: 'Gasto IA',
            descripcion: finalDescription,
            monto_monedas: -requiredCoins,
            saldo_resultante: nuevoSaldo,
        });

        return NextResponse.json({ 
            success: true, 
            deducted: requiredCoins, 
            remaining: nuevoSaldo 
        });

    } catch (e: any) {
        console.error("Error en cobrar API:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

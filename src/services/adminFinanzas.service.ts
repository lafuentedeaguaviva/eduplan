import { db } from "../lib/database";

export const AdminFinanzasService = {
    /**
     * Obtiene la configuración de costos dinámica
     */
    async getConfig() {
        const { data, error } = await db.from('config_monetizacion').select('*').single();
        if (error) throw error;
        return data;
    },

    /**
     * Actualiza la configuración de costos
     */
    async updateConfig(newConfig: any) {
        const { data, error } = await db
            .from('config_monetizacion')
            .update(newConfig)
            .eq('id', newConfig.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Obtiene el ranking de usuarios (Ballenas)
     */
    async getWhales() {
        const { data, error } = await db
            .from('perfiles')
            .select('id, nombres, apellidos, correo, monedas_disponibles, ultimo_plan_comprado')
            .order('monedas_disponibles', { ascending: false })
            .limit(50);
            
        if (error) throw error;
        
        // Sumar monedas gastadas buscando en el historial
        const whalesWithSpent = await Promise.all(data.map(async (user) => {
            const { data: historial } = await db
                .from('historial_transacciones')
                .select('monto_monedas')
                .eq('perfil_id', user.id)
                .lt('monto_monedas', 0); // Solo gastos
                
            const totalQuemado = historial?.reduce((acc, curr) => acc + Math.abs(curr.monto_monedas), 0) || 0;
            return { ...user, monedas_quemadas: totalQuemado };
        }));
        
        return whalesWithSpent.sort((a, b) => b.monedas_quemadas - a.monedas_quemadas);
    },

    /**
     * Asigna un bono demo a un usuario o colegio
     */
    async assignDemoBonus(adminId: string, userId: string, amount: number) {
        // 1. Obtener perfil
        const { data: profile, error } = await db.from('perfiles').select('monedas_disponibles').eq('id', userId).single();
        if (error || !profile) throw new Error("Usuario no encontrado");

        const currentCoins = profile.monedas_disponibles || 0;
        const newCoins = currentCoins + amount;

        // 2. Actualizar saldo
        const { error: updateError } = await db.from('perfiles').update({ monedas_disponibles: newCoins }).eq('id', userId);
        if (updateError) throw updateError;

        // 3. Registrar transacción
        await db.from('historial_transacciones').insert({
            perfil_id: userId,
            tipo: 'Bono Demo',
            descripcion: `Bono Demo Institucional (Aprobado por Admin)`,
            monto_monedas: amount,
            saldo_resultante: newCoins
        });

        return { success: true, newCoins };
    },

    /**
     * Calcula estadísticas financieras generales
     */
    async getFinancialStats() {
        // Ingresos Brutos (Pagos Aprobados)
        const { data: pagos } = await db.from('pagos_qr').select('monto_bob').eq('estado', 'Aprobado');
        const ingresosBrutos = pagos?.reduce((acc, curr) => acc + curr.monto_bob, 0) || 0;

        // Costo IA DeepSeek (Aprox: 1M tokens = 0.14 USD = ~1 Bs)
        const { data: logs } = await db.from('ia_consumo_logs').select('total_tokens').eq('proveedor', 'deepseek');
        const totalTokens = logs?.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0) || 0;
        const costoIaBs = (totalTokens / 1_000_000) * 1.0; 

        // Costo Demos (Monedas regaladas que se quemaron)
        const { data: bonos } = await db.from('historial_transacciones').select('monto_monedas').eq('tipo', 'Bono Demo');
        const totalBonos = bonos?.reduce((acc, curr) => acc + curr.monto_monedas, 0) || 0;
        
        // Supongamos que 100 monedas equivalen a 0.10 Bs de gasto IA real
        const costoDemos = (totalBonos / 100) * 0.10;

        // Costo fijo servidor KVM + BD
        const costoFijoBs = 278; // Aprox 40 USD

        const utilidadNeta = ingresosBrutos - costoIaBs - costoFijoBs;

        return {
            ingresosBrutos,
            costoIaBs: Number(costoIaBs.toFixed(2)),
            costoDemos: Number(costoDemos.toFixed(2)),
            costoFijoBs,
            utilidadNeta: Number(utilidadNeta.toFixed(2)),
            totalTokensDeepSeek: totalTokens
        };
    },

    /**
     * Obtiene los pagos QR pendientes de aprobación
     */
    async getPendingPayments() {
        const { data, error } = await db
            .from('pagos_qr')
            .select(`
                *,
                perfiles:perfil_id ( nombres, apellidos, correo ),
                paquetes_monedas:paquete_id ( nombre, monedas_otorgadas )
            `)
            .eq('estado', 'Pendiente')
            .order('creado_en', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Aprueba un pago QR, asigna las monedas y registra el historial
     */
    async approvePayment(pagoId: number) {
        // 1. Obtener datos del pago
        const { data: pago, error: pagoError } = await db
            .from('pagos_qr')
            .select('*, paquetes_monedas(nombre, monedas_otorgadas)')
            .eq('id', pagoId)
            .single();

        if (pagoError || !pago) throw new Error("Pago no encontrado");
        if (pago.estado !== 'Pendiente') throw new Error("El pago ya fue procesado");

        const userId = pago.perfil_id;
        // The relation returns an array or object depending on schema. We assume object here for one-to-many from perfiles perspective.
        // Actually Supabase might return it as a single object if foreign key is unique per package, or array.
        // Let's safely extract name and coins.
        const paqueteNombre = Array.isArray(pago.paquetes_monedas) ? pago.paquetes_monedas[0]?.nombre : pago.paquetes_monedas?.nombre;
        const monedasCompradas = Array.isArray(pago.paquetes_monedas) ? pago.paquetes_monedas[0]?.monedas_otorgadas : pago.paquetes_monedas?.monedas_otorgadas;
        
        if (!monedasCompradas) throw new Error("No se pudo determinar la cantidad de monedas del paquete");

        // 2. Obtener saldo actual
        const { data: profile } = await db.from('perfiles').select('monedas_disponibles').eq('id', userId).single();
        const saldoActual = profile?.monedas_disponibles || 0;
        const nuevoSaldo = saldoActual + monedasCompradas;

        // 3. Actualizar perfil
        await db.from('perfiles').update({ 
            monedas_disponibles: nuevoSaldo,
            ultimo_plan_comprado: paqueteNombre
        }).eq('id', userId);

        // 4. Registrar en historial
        await db.from('historial_transacciones').insert({
            perfil_id: userId,
            tipo: 'Compra',
            descripcion: `Compra Aprobada: ${paqueteNombre}`,
            monto_monedas: monedasCompradas,
            saldo_resultante: nuevoSaldo
        });

        // 5. Marcar pago como aprobado
        await db.from('pagos_qr').update({ estado: 'Aprobado' }).eq('id', pagoId);

        return { success: true };
    },

    /**
     * Rechaza un pago QR
     */
    async rejectPayment(pagoId: number) {
        const { error } = await db
            .from('pagos_qr')
            .update({ estado: 'Rechazado' })
            .eq('id', pagoId);

        if (error) throw error;
        return { success: true };
    }
};

import { db } from "../lib/database";
import { v4 as uuidv4 } from "uuid";

export const BillingService = {
    /**
     * Obtiene el saldo actual y el último plan comprado del usuario
     */
    async getUserWallet(userId: string) {
        const { data, error } = await db
            .from('perfiles')
            .select('monedas_disponibles, ultimo_plan_comprado')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return {
            balance: data?.monedas_disponibles || 0,
            lastPlan: data?.ultimo_plan_comprado || 'Plan Gratuito / Demo'
        };
    },

    /**
     * Obtiene el historial de transacciones del usuario
     */
    async getTransactionHistory(userId: string) {
        const { data, error } = await db
            .from('historial_transacciones')
            .select('*')
            .eq('perfil_id', userId)
            .order('fecha', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Obtiene los paquetes de monedas disponibles para la venta
     */
    async getAvailablePackages() {
        const { data, error } = await db
            .from('paquetes_monedas')
            .select('*')
            .eq('activo', true)
            .order('orden', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Sube un comprobante de pago QR y registra la solicitud
     */
    async submitQrPayment(userId: string, packageId: string, montoBob: number, file: File) {
        // 1. Subir imagen a Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${uuidv4()}.${fileExt}`;
        const filePath = `comprobantes/${fileName}`;

        const { error: uploadError } = await db.storage
            .from('comprobantes_qr')
            .upload(filePath, file);

        if (uploadError) throw new Error("Error subiendo el comprobante: " + uploadError.message);

        // 2. Obtener URL pública
        const { data: { publicUrl } } = db.storage
            .from('comprobantes_qr')
            .getPublicUrl(filePath);

        // 3. Registrar en pagos_qr
        const { error: insertError } = await db
            .from('pagos_qr')
            .insert({
                perfil_id: userId,
                paquete_id: packageId,
                monto_bob: montoBob,
                comprobante_url: publicUrl,
                estado: 'Pendiente'
            });

        if (insertError) throw new Error("Error registrando el pago: " + insertError.message);

        return { success: true, url: publicUrl };
    }
};

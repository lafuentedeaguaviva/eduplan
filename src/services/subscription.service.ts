import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

export interface SubscriptionPlan {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    limite_creditos: number;
    caracteristicas: string[];
    color_scheme: string;
}

export const SubscriptionService = {
    /**
     * Obtiene todos los planes de suscripción disponibles.
     */
    async getPlans(): Promise<ServiceResponse<SubscriptionPlan[]>> {
        const { data, error } = await supabase
            .from('planes_suscripcion')
            .select('*')
            .order('precio', { ascending: true });
        
        return { 
            data: data as SubscriptionPlan[] || [], 
            error, 
            success: !error 
        };
    },

    /**
     * Crea una nueva suscripción para el usuario (Simulación de pago exitoso).
     */
    async subscribeUser(userId: string, planId: number): Promise<ServiceResponse<any>> {
        // En una implementación real, esto se llamaría desde un webhook de Stripe/PayPal
        // Aquí lo hacemos directo para el MVP
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setMonth(fechaFin.getMonth() + 1); // 1 mes de duración

        const { data, error } = await supabase
            .from('suscripciones')
            .upsert({
                perfil_id: userId,
                plan_id: planId,
                estado: 'activo',
                fecha_inicio: fechaInicio.toISOString(),
                fecha_fin: fechaFin.toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        return { data, error, success: !error };
    },

    /**
     * Obtiene el catálogo de costos por acción.
     */
    async getServiceCosts(): Promise<ServiceResponse<Record<string, number>>> {
        const { data, error } = await supabase
            .from('costos_servicios')
            .select('accion, costo_creditos');

        const costs: Record<string, number> = {};
        data?.forEach(item => {
            costs[item.accion] = item.costo_creditos;
        });

        return { data: costs, error, success: !error };
    }
};

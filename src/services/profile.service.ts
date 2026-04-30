import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

/**
 * Representa el perfil completo de un profesor en el sistema.
 */
export interface UserSubscription {
    id: string;
    plan_id: number;
    plan_nombre: string;
    estado: 'activo' | 'cancelado' | 'expirado' | 'trial';
    fecha_fin: string | null;
    limite_creditos: number;
}

export interface UserProfile {
    id: string;
    email: string;
    nombres: string;
    apellidos: string;
    titulo?: string;
    celular?: string;
    foto_url?: string;
    creditos: number;
    gemini_api_key?: string;
    solicitudes_ia_hoy: number;
    ultima_solicitud_ia: string;
    roles?: string[];
    estado_completitud?: boolean;
    suscripcion?: UserSubscription | null;
}

/**
 * Model: ProfileService
 * 
 * Gestiona los datos del perfil del profesor y sus roles asociados.
 */
export const ProfileService = {
    /**
     * Recupera el perfil completo del usuario, incluyendo sus roles.
     * @param {string} userId - UUID del usuario.
     * @returns {Promise<UserProfile | null>} Objeto de perfil o null si no se encuentra.
     */
    /**
     * Recupera el perfil completo del usuario, incluyendo sus roles.
     */
    async getProfile(userId: string): Promise<ServiceResponse<UserProfile | null>> {
        try {
            // 1. Get Profile Data from 'public' schema
            const { data: profile, error } = await supabase
                .from('perfiles')
                .select('*, gemini_api_key')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                return { data: null, error, success: false };
            }

            if (!profile) {
                return { data: null, error: null, success: true };
            }

            // 2. Get Roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('perfil_roles')
                .select('rol_nombre')
                .eq('perfil_id', userId);

            const roles = rolesData?.map((r: any) => r.rol_nombre) || [];
            
            // 3. Get Active Subscription
            const { data: subData } = await supabase
                .from('suscripciones')
                .select(`
                    id, 
                    estado, 
                    fecha_fin, 
                    plan_id,
                    planes_suscripcion (
                        nombre,
                        limite_creditos
                    )
                `)
                .eq('perfil_id', userId)
                .eq('estado', 'activo')
                .maybeSingle();

            let suscripcion = null;
            if (subData) {
                const plan: any = subData.planes_suscripcion;
                suscripcion = {
                    id: subData.id,
                    plan_id: subData.plan_id,
                    plan_nombre: plan?.nombre || 'Error',
                    estado: subData.estado as any,
                    fecha_fin: subData.fecha_fin,
                    limite_creditos: plan?.limite_creditos || 0
                };
            }

            return {
                data: { ...profile, roles, suscripcion } as UserProfile,
                error: rolesError,
                success: true
            };

        } catch (error: any) {
            return { data: null, error, success: false };
        }
    },

    /**
     * Actualiza el perfil del usuario. Realiza un 'upsert' basado en el ID.
     */
    async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<ServiceResponse<any>> {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .upsert({
                    id: userId,
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            return { data, error, success: !error };
        } catch (error: any) {
            return { data: null, error, success: false };
        }
    }
};

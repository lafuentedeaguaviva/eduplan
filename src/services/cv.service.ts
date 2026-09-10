import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

export interface CVData {
    formacion_academica: any[];
    experiencia_laboral: any[];
    habilidades: any[];
    sobre_mi: string;
}

export const CVService = {
    /**
     * Obtiene el CV del profesor dado su perfil_id
     */
    async getProfesorCV(perfilId: string): Promise<ServiceResponse<CVData | null>> {
        try {
            const { data, error } = await supabase
                .from('profesor_cv')
                .select('*')
                .eq('perfil_id', perfilId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                return { data: null, error, success: false };
            }

            return { data: data || null, error: null, success: true };
        } catch (error: any) {
            console.error('Error in getProfesorCV:', error);
            return { data: null, error, success: false };
        }
    },

    /**
     * Inserta o actualiza el CV del profesor
     */
    async upsertProfesorCV(perfilId: string, cvData: Partial<CVData>): Promise<ServiceResponse<any>> {
        try {
            // Check if exists first
            const { data: existing } = await supabase
                .from('profesor_cv')
                .select('id')
                .eq('perfil_id', perfilId)
                .single();

            let result;
            if (existing) {
                result = await supabase
                    .from('profesor_cv')
                    .update({ ...cvData, updated_at: new Date().toISOString() })
                    .eq('perfil_id', perfilId);
            } else {
                result = await supabase
                    .from('profesor_cv')
                    .insert([{ perfil_id: perfilId, ...cvData }]);
            }

            if (result.error) throw result.error;
            return { data: result.data, error: null, success: true };
        } catch (error: any) {
            console.error('Error in upsertProfesorCV:', error);
            return { data: null, error, success: false };
        }
    }
};

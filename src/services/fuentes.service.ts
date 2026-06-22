import { supabase } from '@/lib/supabase';
import { MiFuenteLibraryItem, MiFuenteItem, TipoFuente, ServiceResponse } from '@/types';

let tiposFuenteCache: TipoFuente[] | null = null;
let miFuentesCache: MiFuenteLibraryItem[] | null = null;

export const FuentesService = {
    /**
     * Obtiene todos los tipos de fuente del catálogo (tipo_fuente).
     */
    async getTiposFuente(): Promise<ServiceResponse<TipoFuente[]>> {
        if (tiposFuenteCache) {
            return { data: tiposFuenteCache, error: null, success: true };
        }
        const { data, error } = await supabase
            .from('tipo_fuente')
            .select('*')
            .order('tipo_fuente', { ascending: true });
        
        if (!error && data) {
            tiposFuenteCache = data as TipoFuente[];
        }
        return { data, error, success: !error };
    },

    /**
     * Obtiene las fuentes personales del docente autenticado.
     */
    async getMiFuentes(): Promise<ServiceResponse<MiFuenteLibraryItem[]>> {
        if (miFuentesCache) {
            return { data: miFuentesCache, error: null, success: true };
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], error: 'No user session', success: false };

        // Lectura ultra simple para evitar fallos de Join
        const { data, error } = await supabase
            .from('biblioteca_mi_fuente')
            .select('*')
            .eq('perfil_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            miFuentesCache = data as MiFuenteLibraryItem[];
        }
        return { data: data as MiFuenteLibraryItem[], error, success: !error };
    },

    /**
     * Crea o actualiza una fuente en 'biblioteca_mi_fuente'.
     */
    async upsertMiFuente(item: Partial<MiFuenteLibraryItem>): Promise<ServiceResponse<MiFuenteLibraryItem>> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: null, error: 'No user session', success: false };

        // Invalida la caché local de mis fuentes
        miFuentesCache = null;

        // Limpiamos el objeto de relación para no enviarlo a la DB
        const { tipo_fuente_obj, ...cleanItem } = item as any;

        const payload = { 
            ...cleanItem,
            perfil_id: user.id 
        };

        const { data, error } = await supabase
            .from('biblioteca_mi_fuente')
            .upsert(payload)
            .select('*')
            .single();

        return { data: data as MiFuenteLibraryItem, error, success: !error };
    },

    /**
     * Guarda una fuente en la tabla de instancia 'mi_fuente'.
     */
    async saveToPlanning(item: Partial<MiFuenteItem>): Promise<ServiceResponse<MiFuenteItem>> {
        const { data, error } = await supabase
            .from('mi_fuente')
            .insert(item)
            .select()
            .single();
        return { data: data as MiFuenteItem, error, success: !error };
    },

    /**
     * Elimina una fuente guardada de la tabla de instancia 'mi_fuente'.
     */
    async deleteMiFuente(id: number | string): Promise<ServiceResponse<null>> {
        const { error } = await supabase
            .from('mi_fuente')
            .delete()
            .eq('id_fuente', id);
        return { data: null, error, success: !error };
    },

    /**
     * Obtiene las fuentes asociadas a múltiples IDs de planificación semanal.
     */
    async getByWeekIds(weekIds: string[]): Promise<ServiceResponse<MiFuenteItem[]>> {
        const { data, error } = await supabase
            .from('mi_fuente')
            .select('*')
            .in('planificacion_semanal_id', weekIds);

        return { data: data as MiFuenteItem[] || [], error, success: !error };
    }
};

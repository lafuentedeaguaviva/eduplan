import { supabase } from '@/lib/supabase';
import { ServiceResponse } from '@/types';

export interface SystemStats {
    totalUsers: number;
    totalUnits: number;
    totalPDCs: number;
}

export interface Unit {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    distrito_id: number;
    distrito?: {
        id: number;
        nombre: string;
        departamento?: { nombre: string }
    };
}

export interface District {
    id: number;
    nombre: string;
    departamento?: {
        nombre: string
    };
}

export const AdminService = {
    async getSystemStats(): Promise<ServiceResponse<SystemStats>> {
        try {
            const [users, units, pdcs] = await Promise.all([
                supabase.from('perfiles').select('*', { count: 'exact', head: true }),
                supabase.from('unidades_educativas').select('*', { count: 'exact', head: true }),
                supabase.from('contenidos_usuario').select('*', { count: 'exact', head: true })
            ]);

            if (users.error) throw users.error;
            if (units.error) throw units.error;
            if (pdcs.error) throw pdcs.error;

            return {
                data: {
                    totalUsers: users.count || 0,
                    totalUnits: units.count || 0,
                    totalPDCs: pdcs.count || 0
                },
                error: null,
                success: true
            };
        } catch (error: any) {
            console.error('Error fetching system stats:', error);
            return { data: null, error, success: false };
        }
    },

    async getUnits(): Promise<ServiceResponse<Unit[]>> {
        try {
            const { data, error } = await supabase
                .from('unidades_educativas')
                .select(`
                    id, 
                    nombre, 
                    direccion, 
                    telefono, 
                    distrito_id,
                    distrito:distritos(
                        id,
                        nombre, 
                        departamento:departamentos(nombre)
                    )
                `)
                .order('nombre');

            if (error) throw error;

            const mappedData = (data || []).map(u => ({
                ...u,
                distrito: Array.isArray(u.distrito) ? {
                    ...u.distrito[0],
                    departamento: Array.isArray(u.distrito[0]?.departamento)
                        ? u.distrito[0].departamento[0]
                        : u.distrito[0]?.departamento
                } : u.distrito
            })) as unknown as Unit[];

            return { data: mappedData, error: null, success: true };
        } catch (error: any) {
            console.error('Error fetching units:', error);
            return { data: [], error, success: false };
        }
    },

    async createUnit(unit: { id: number; nombre: string; direccion?: string; telefono?: string; distrito_id: number }): Promise<ServiceResponse<Unit>> {
        const { data, error } = await supabase
            .from('unidades_educativas')
            .insert(unit)
            .select()
            .single();
        return { data: data as Unit, error, success: !error };
    },

    async updateUnit(id: number, updates: Partial<{ nombre: string; direccion: string; telefono: string; distrito_id: number }>): Promise<ServiceResponse<Unit>> {
        const { data, error } = await supabase
            .from('unidades_educativas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data: data as Unit, error, success: !error };
    },

    async deleteUnit(id: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('unidades_educativas')
            .delete()
            .eq('id', id)
            .select();
        return { data, error, success: !error };
    },

    async getDistricts(): Promise<ServiceResponse<District[]>> {
        const { data, error } = await supabase
            .from('distritos')
            .select('id, nombre, departamento:departamentos(nombre)')
            .order('nombre');

        const mappedData = (data || []).map(d => ({
            ...d,
            departamento: Array.isArray(d.departamento) ? d.departamento[0] : d.departamento
        })) as unknown as District[];

        return { data: mappedData, error, success: !error };
    },

    async getUsers(): Promise<ServiceResponse<any[]>> {
        try {
            const { data: profiles, error: profilesError } = await supabase
                .from('perfiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            const { data: allRoles, error: rolesError } = await supabase
                .from('perfil_roles')
                .select('perfil_id, rol_nombre');

            if (rolesError) throw rolesError;

            const users = profiles.map(p => ({
                ...p,
                roles: allRoles
                    .filter((r: any) => r.perfil_id === p.id)
                    .map((r: any) => r.rol_nombre)
            }));

            return { data: users, error: null, success: true };
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return { data: [], error, success: false };
        }
    },

    async getRoles(): Promise<ServiceResponse<string[]>> {
        const { data, error } = await supabase
            .from('roles')
            .select('nombre')
            .order('nombre');
        return { data: data?.map(r => r.nombre) || [], error, success: !error };
    },

    async updateUserRoles(userId: string, roles: string[]): Promise<ServiceResponse<any>> {
        try {
            const { error: deleteError } = await supabase
                .from('perfil_roles')
                .delete()
                .eq('perfil_id', userId);

            if (deleteError) throw deleteError;

            if (roles.length > 0) {
                const toInsert = roles.map(r => ({
                    perfil_id: userId,
                    rol_nombre: r
                }));

                const { error: insertError } = await supabase
                    .from('perfil_roles')
                    .insert(toInsert);

                if (insertError) throw insertError;
            }

            return { data: { userId, roles }, error: null, success: true };
        } catch (error: any) {
            console.error('Error updating roles:', error);
            return { data: null, error, success: false };
        }
    },

    async getGlobalSchedule(gestion?: number, trimestre?: number): Promise<ServiceResponse<any[]>> {
        let query = supabase
            .from('planificacion_semanal_general')
            .select('*')
            .order('mes', { ascending: true })
            .order('semana', { ascending: true });

        if (gestion) query = query.eq('gestion', gestion);
        if (trimestre) query = query.eq('trimestre', trimestre);

        const { data, error } = await query;
        return { data, error, success: !error };
    },

    async createGlobalWeek(week: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal_general')
            .insert(week)
            .select()
            .single();
        return { data, error, success: !error };
    },

    async updateGlobalWeek(id: number, updates: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal_general')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        return { data, error, success: !error };
    },

    async deleteGlobalWeek(id: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal_general')
            .delete()
            .eq('id', id)
            .select();
        return { data, error, success: !error };
    },

    async deleteTrimesterSchedule(gestion: number, trimestre: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('planificacion_semanal_general')
            .delete()
            .eq('gestion', gestion)
            .eq('trimestre', trimestre)
            .select();
        return { data, error, success: !error };
    },

    async bulkGenerateGlobalSchedule(params: {
        gestion: number;
        trimestre: number;
        weeks: any[];
    }): Promise<ServiceResponse<{ success: boolean; count: number }>> {
        try {
            await this.deleteTrimesterSchedule(params.gestion, params.trimestre);

            const finalWeeks = params.weeks.map(w => ({
                id: (params.gestion % 100 * 1000) + (params.trimestre * 100) + (w.mes * 10) + w.semana,
                gestion: params.gestion,
                trimestre: params.trimestre,
                mes: w.mes,
                semana: w.semana,
                fecha_inicio_trimestre: w.fecha_inicio_trimestre,
                fecha_fin_trimestre: w.fecha_fin_trimestre
            }));

            const { error } = await supabase
                .from('planificacion_semanal_general')
                .upsert(finalWeeks, { onConflict: 'id' });

            if (error) throw error;

            return {
                data: { success: true, count: finalWeeks.length },
                error: null,
                success: true
            };
        } catch (error: any) {
            console.error('Bulk generate error:', error);
            return { data: null, error, success: false };
        }
    },

    // --- CURRICULUM MANAGEMENT ---

    async getNiveles(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase.from('niveles').select('*').order('id');
        return { data, error, success: !error };
    },

    async getGrados(nivelId?: number): Promise<ServiceResponse<any[]>> {
        let query = supabase.from('grados').select('*, nivel:niveles(nombre)').order('id');
        if (nivelId) query = query.eq('nivel_id', nivelId);
        const { data, error } = await query;
        return { data, error, success: !error };
    },

    async getAreas(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase.from('areas_conocimiento').select('*').order('nombre');
        return { data, error, success: !error };
    },

    async getContenidosBase(gradoId?: number, areaId?: number): Promise<ServiceResponse<any[]>> {
        let query = supabase.from('contenidos_base').select('*, grado:grados(nombre), area:areas_conocimiento(nombre)').order('id');
        if (gradoId) query = query.eq('grado_id', gradoId);
        if (areaId) query = query.eq('area_id', areaId);
        const { data, error } = await query;
        return { data, error, success: !error };
    },

    async upsertContenidoBase(contenido: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase.from('contenidos_base').upsert(contenido).select().single();
        return { data, error, success: !error };
    },

    async deleteContenidoBase(id: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase.from('contenidos_base').delete().eq('id', id);
        return { data, error, success: !error };
    },

    // --- LIBRARY MANAGEMENT ---

    async getLibraryTable(tableName: string): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
        return { data, error, success: !error };
    },

    async upsertLibraryItem(tableName: string, item: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase.from(tableName).upsert(item).select().single();
        return { data, error, success: !error };
    },

    async deleteLibraryItem(tableName: string, id: any, idColumnName: string = 'id'): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase.from(tableName).delete().eq(idColumnName, id);
        return { data, error, success: !error };
    }
};


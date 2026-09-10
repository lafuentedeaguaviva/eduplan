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
    director_id?: string;
    director?: {
        nombres: string;
        apellidos: string;
    };
    distrito_nombre?: string;
    departamento_nombre?: string;
}

export interface District {
    id: number;
    nombre: string;
    departamento_id?: number;
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

    async getDetailedStats(): Promise<ServiceResponse<any>> {
        try {
            // Fetch raw created_at data for users and PDCs to calculate trends locally
            // In a production scenario with millions of rows, this should be an RPC.
            const [usersRes, pdcsRes, areasRes] = await Promise.all([
                supabase.from('perfiles').select('created_at'),
                supabase.from('pdcs').select('created_at'),
                supabase.from('areas_conocimiento').select('nombre')
            ]);

            if (usersRes.error) throw usersRes.error;
            if (pdcsRes.error) throw pdcsRes.error;

            // Simple mock aggregation for demo purposes of the UI
            // Real implementation would parse dates and group by month
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            // Generate mock growth data based on total counts
            const userCount = usersRes.data?.length || 0;
            const pdcCount = pdcsRes.data?.length || 0;
            
            const growthData = monthNames.map((month, index) => {
                const modifier = (index + 1) / 12; // Simulate growth over the year
                return {
                    name: month,
                    usuarios: Math.floor((userCount * modifier) * (0.8 + Math.random() * 0.4)),
                    pdcs: Math.floor((pdcCount * modifier) * (0.8 + Math.random() * 0.4)),
                };
            });

            // Mock distribution data
            const distributionData = [
                { name: 'Matemáticas', value: 35 },
                { name: 'Lenguaje', value: 25 },
                { name: 'Ciencias Naturales', value: 20 },
                { name: 'Ciencias Sociales', value: 15 },
                { name: 'Otros', value: 5 },
            ];

            const roleDistributionData = [
                { name: 'Profesores', value: 85 },
                { name: 'Directores', value: 10 },
                { name: 'Administradores', value: 5 },
            ];

            return {
                data: {
                    growthData,
                    distributionData,
                    roleDistributionData,
                    summary: {
                        activeUsersLast30Days: Math.floor(userCount * 0.4),
                        pdcsGeneratedLast30Days: Math.floor(pdcCount * 0.6),
                        aiTokensUsed: '1.2M',
                        avgPDCsPerUser: userCount > 0 ? (pdcCount / userCount).toFixed(1) : 0
                    }
                },
                error: null,
                success: true
            };
        } catch (error: any) {
            console.error('Error fetching detailed stats:', error);
            return { data: null, error, success: false };
        }
    },

    async getUnits(): Promise<ServiceResponse<Unit[]>> {
        try {
            let allData: any[] = [];
            let from = 0;
            let finished = false;

            while (!finished) {
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
                        ),
                        director_id,
                        director:perfiles!unidades_educativas_director_id_fkey(nombres, apellidos)
                    `)
                    .order('nombre')
                    .range(from, from + 999);

                if (error) throw error;
                if (!data || data.length === 0) {
                    finished = true;
                } else {
                    allData = [...allData, ...data];
                    if (data.length < 1000) finished = true;
                    else from += 1000;
                }
            }

            const mappedData = allData.map(u => {
                const distrito = Array.isArray(u.distrito) ? u.distrito[0] : u.distrito;
                const departamento = distrito ? (Array.isArray(distrito.departamento) ? distrito.departamento[0] : distrito.departamento) : null;
                
                return {
                    ...u,
                    distrito_nombre: distrito?.nombre || 'S/D',
                    departamento_nombre: departamento?.nombre || 'S/D',
                    distrito: distrito,
                    departamento: departamento
                };
            }) as unknown as Unit[];

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

    async getDepartments(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('departamentos')
            .select('*')
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    async saveDepartment(dept: any, isEditing: boolean): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('departamentos')
            .upsert(dept)
            .select()
            .single();
        return { data, error, success: !error };
    },

    async deleteDepartment(id: number): Promise<ServiceResponse<any>> {
        const { error } = await supabase.from('departamentos').delete().eq('id', id);
        return { data: null, error, success: !error };
    },

    async getDistricts(): Promise<ServiceResponse<District[]>> {
        try {
            let allData: any[] = [];
            let from = 0;
            let finished = false;

            while (!finished) {
                const { data, error } = await supabase
                    .from('distritos')
                    .select('id, nombre, departamento_id, departamento:departamentos(nombre)')
                    .order('nombre')
                    .range(from, from + 999);

                if (error) throw error;
                if (!data || data.length === 0) {
                    finished = true;
                } else {
                    allData = [...allData, ...data];
                    if (data.length < 1000) finished = true;
                    else from += 1000;
                }
            }

            const mappedData = allData.map(d => ({
                ...d,
                departamento: Array.isArray(d.departamento) ? d.departamento[0] : d.departamento
            })) as unknown as District[];

            return { data: mappedData, error: null, success: true };
        } catch (error: any) {
            console.error('Error fetching districts:', error);
            return { data: [], error, success: false };
        }
    },

    async saveDistrict(district: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('distritos')
            .upsert(district)
            .select()
            .single();
        return { data, error, success: !error };
    },

    async deleteDistrict(id: number): Promise<ServiceResponse<any>> {
        const { error } = await supabase.from('distritos').delete().eq('id', id);
        return { data: null, error, success: !error };
    },

    async getUsers(): Promise<ServiceResponse<any[]>> {
        try {
            let profiles: any[] = [];
            let from = 0;
            let finished = false;

            while (!finished) {
                const { data, error } = await supabase
                    .from('perfiles')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .range(from, from + 999);

                if (error) throw error;
                if (!data || data.length === 0) {
                    finished = true;
                } else {
                    profiles = [...profiles, ...data];
                    if (data.length < 1000) finished = true;
                    else from += 1000;
                }
            }

            // Fetch units where users are directors (Multi-level)
            const { data: directorAssignments, error: dirError } = await supabase
                .from('gestion_directores')
                .select(`
                    unidad_id, 
                    nivel, 
                    perfil_id,
                    unidades_educativas (nombre)
                `);

            if (dirError) throw dirError;

            const { data: allRoles, error: rolesError } = await supabase
                .from('perfil_roles')
                .select('perfil_id, rol_nombre');

            if (rolesError) throw rolesError;

            // Fetch units where users are personal (Secretario)
            const { data: personalAssignments, error: personalError } = await supabase
                .from('unidad_educativa_personal')
                .select(`
                    unidad_educativa_id,
                    perfil_id,
                    rol_institucional,
                    unidades_educativas (nombre)
                `);

            if (personalError) throw personalError;

            let areasTrabajo: any[] = [];
            from = 0;
            finished = false;

            while (!finished) {
                const { data, error } = await supabase
                    .from('areas_trabajo')
                    .select(`
                        profesor_id,
                        unidad_educativa_id,
                        unidades_educativas (
                            nombre,
                            distrito_id,
                            distritos (
                                nombre,
                                departamento_id
                            )
                        ),
                        area_conocimiento_id,
                        areas_conocimiento (nombre)
                    `)
                    .range(from, from + 999);

                if (error) throw error;
                if (!data || data.length === 0) {
                    finished = true;
                } else {
                    areasTrabajo = [...areasTrabajo, ...data];
                    if (data.length < 1000) finished = true;
                    else from += 1000;
                }
            }

            const users = profiles.map(p => {
                const userAreas = areasTrabajo?.filter((at: any) => at.profesor_id === p.id) || [];
                const dirAssig = directorAssignments?.find((da: any) => da.perfil_id === p.id);
                const persAssig = personalAssignments?.find((pa: any) => pa.perfil_id === p.id);
                
                const unidadesIds = Array.from(new Set([
                    ...userAreas.map((at: any) => at.unidad_educativa_id),
                    ...(dirAssig ? [dirAssig.unidad_id] : []),
                    ...(persAssig ? [persAssig.unidad_educativa_id] : [])
                ]));

                const distritosIds = Array.from(new Set(userAreas.map((at: any) => at.unidades_educativas?.distrito_id))).filter(id => id !== undefined);
                const departamentosIds = Array.from(new Set(userAreas.map((at: any) => at.unidades_educativas?.distritos?.departamento_id))).filter(id => id !== undefined);

                const roles = allRoles.filter((r: any) => r.perfil_id === p.id).map((r: any) => r.rol_nombre);
                
                let unidadesNombres = Array.from(new Set(userAreas.map((at: any) => 
                    at.unidades_educativas 
                        ? `${at.unidades_educativas.nombre} (${at.unidades_educativas.distritos?.nombre || 'S/D'})` 
                        : ''
                ))).filter(n => n !== '').join(', ');

                if (dirAssig) {
                    const ueData = dirAssig.unidades_educativas as any;
                    const ueName = (Array.isArray(ueData) ? ueData[0]?.nombre : ueData?.nombre) || 'Unidad';
                    const label = `(DIR ${dirAssig.nivel.toUpperCase()})`;
                    if (!unidadesNombres.includes(ueName)) {
                        unidadesNombres = unidadesNombres ? `${ueName} ${label}, ${unidadesNombres}` : `${ueName} ${label}`;
                    }
                }

                if (persAssig) {
                    const ueData = persAssig.unidades_educativas as any;
                    const ueName = (Array.isArray(ueData) ? ueData[0]?.nombre : ueData?.nombre) || 'Unidad';
                    const label = `(${persAssig.rol_institucional.toUpperCase()})`;
                    if (!unidadesNombres.includes(ueName)) {
                        unidadesNombres = unidadesNombres ? `${ueName} ${label}, ${unidadesNombres}` : `${ueName} ${label}`;
                    }
                }

                return {
                    ...p,
                    roles,
                    unidades_ids: unidadesIds,
                    director_unidad_id: dirAssig?.unidad_id || null,
                    director_nivel: dirAssig?.nivel || 'General',
                    distritos_ids: distritosIds,
                    departamentos_ids: departamentosIds,
                    areas_ids: Array.from(new Set(userAreas.map((at: any) => at.area_conocimiento_id))),
                    unidades_nombres: unidadesNombres,
                    areas_nombres: Array.from(new Set(userAreas.map((at: any) => at.areas_conocimiento?.nombre))).join(', ')
                };
            });

            return { data: users, error: null, success: true };
        } catch (error: any) {
            console.error('Error fetching users:', error);
            return { data: [], error, success: false };
        }
    },

    async getRoles(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('roles')
            .select('nombre, descripcion')
            .order('nombre');
        return { data: data || [], error, success: !error };
    },

    async getRolesWithStats(): Promise<ServiceResponse<any[]>> {
        try {
            // 1. Intentar obtener roles base
            const { data: roles, error: rolesError } = await supabase
                .from('roles')
                .select('nombre, descripcion')
                .order('nombre');

            if (rolesError) throw rolesError;

            // 2. Intentar obtener conteos (si falla, seguimos con roles pero con counts en 0)
            let safeCounts: any[] = [];
            try {
                const { data: counts, error: countsError } = await supabase
                    .from('perfil_roles')
                    .select('rol_nombre');
                
                if (!countsError && counts) {
                    safeCounts = counts;
                }
            } catch (e) {
                console.warn('Could not fetch role counts, defaulting to 0:', e);
            }

            const rolesWithStats = (roles || []).map(role => ({
                ...role,
                userCount: safeCounts.filter(c => c.rol_nombre === role.nombre).length
            }));

            return { data: rolesWithStats, error: null, success: true };
        } catch (error: any) {
            console.error('Critical error fetching roles with stats:', error);
            return { data: [], error, success: false };
        }
    },

    async createRole(role: { nombre: string; descripcion: string }): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('roles')
            .insert(role)
            .select()
            .single();
        return { data, error, success: !error };
    },

    async updateRole(nombre: string, updates: { descripcion: string }): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('roles')
            .update(updates)
            .eq('nombre', nombre)
            .select()
            .single();
        return { data, error, success: !error };
    },

    async deleteRole(nombre: string): Promise<ServiceResponse<any>> {
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('nombre', nombre);
        return { data: null, error, success: !error };
    },

    async getDirectors(): Promise<ServiceResponse<any[]>> {
        try {
            const { data, error } = await supabase
                .from('perfil_roles')
                .select('perfiles(id, nombres, apellidos, email)')
                .eq('rol_nombre', 'Director');

            if (error) throw error;
            
            const directors = (data || []).map((d: any) => d.perfiles);
            return { data: directors, error: null, success: true };
        } catch (error: any) {
            console.error('Error fetching directors:', error);
            return { data: [], error, success: false };
        }
    },

    async updateUserRoles(userId: string, roles: string[], unitId?: number | null, unitLevel: string = 'General'): Promise<ServiceResponse<any>> {
        try {
            console.log('DEBUG: Iniciando actualización de roles para:', { userId, roles, unitId, unitLevel });

            // 1. Eliminar roles actuales
            const { error: deleteRolesError } = await supabase
                .from('perfil_roles')
                .delete()
                .eq('perfil_id', userId);

            if (deleteRolesError) {
                console.error('Error al eliminar roles previos:', deleteRolesError);
                throw new Error(`Error al limpiar roles: ${deleteRolesError.message}`);
            }

            // 2. Insertar nuevos roles
            if (roles.length > 0) {
                const toInsert = roles.map(r => ({
                    perfil_id: userId,
                    rol_nombre: r
                }));

                const { error: insertRolesError } = await supabase
                    .from('perfil_roles')
                    .insert(toInsert);

                if (insertRolesError) {
                    console.error('Error al insertar nuevos roles:', insertRolesError);
                    throw new Error(`Error al asignar roles: ${insertRolesError.message}`);
                }
            }

            // 3. Gestionar vinculación de Director
            // Siempre intentamos limpiar cualquier vinculación previa de este usuario como director
            const { error: cleanDirError } = await supabase
                .from('gestion_directores')
                .delete()
                .eq('perfil_id', userId);
            
            if (cleanDirError) {
                console.error('Error al limpiar vinculación previa de director:', cleanDirError);
                // No lanzamos error aquí para permitir que la actualización de roles continúe, 
                // pero lo registramos.
            }

            // También limpiar cualquier asignación como personal (ej: Secretario previo)
            const { error: cleanPersonalError } = await supabase
                .from('unidad_educativa_personal')
                .delete()
                .eq('perfil_id', userId);
            
            if (cleanPersonalError) {
                console.error('Error al limpiar vinculación previa de personal:', cleanPersonalError);
            }

            if (roles.includes('Director') && unitId) {
                // Si es Director y hay una unidad seleccionada, vinculamos
                // Primero limpiamos si alguien más ocupa ese nivel en esa unidad para evitar conflicto UNIQUE
                const { error: conflictClearError } = await supabase
                    .from('gestion_directores')
                    .delete()
                    .eq('unidad_id', unitId)
                    .eq('nivel', unitLevel);
                
                if (conflictClearError) console.warn('Aviso: No se pudo verificar conflictos de director:', conflictClearError.message);

                const { error: insertDirError } = await supabase
                    .from('gestion_directores')
                    .insert({
                        unidad_id: unitId,
                        perfil_id: userId,
                        nivel: unitLevel
                    });
                
                if (insertDirError) {
                    console.error('Error al insertar vinculación de director:', insertDirError);
                    throw new Error(`Error al vincular con la unidad educativa: ${insertDirError.message}`);
                }
            } else if (roles.includes('Secretario') && unitId) {
                // Si es Secretario, lo agregamos a unidad_educativa_personal
                const { error: insertPersonalError } = await supabase
                    .from('unidad_educativa_personal')
                    .insert({
                        unidad_educativa_id: unitId,
                        perfil_id: userId,
                        rol_institucional: 'Secretario'
                    });
                
                if (insertPersonalError) {
                    console.error('Error al insertar vinculación de secretario:', insertPersonalError);
                    throw new Error(`Error al vincular con la unidad educativa como Secretario: ${insertPersonalError.message}`);
                }
            }

            return { data: { userId, roles, unitId, unitLevel }, error: null, success: true };
        } catch (error: any) {
            console.error('CRITICAL: Error updating user roles/director assignment:', {
                userId,
                roles,
                unitId,
                unitLevel,
                errorMessage: error.message,
                errorDetails: error.details,
                errorHint: error.hint,
                errorCode: error.code
            });
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
        const { data, error } = await supabase.from('areas_conocimiento').select('*').order('nombre').range(0, 1000);
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
    },

    async getGlobalSettings(): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('configuracion_global')
            .select('*')
            .eq('id', 'current_config')
            .maybeSingle();
        return { data, error, success: !error };
    },

    async updateGlobalSettings(settings: any): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('configuracion_global')
            .upsert({ id: 'current_config', ...settings })
            .select()
            .single();
        return { data, error, success: !error };
    },

    async createProfile(profile: { email: string, password?: string, nombres?: string, apellidos?: string, roles?: string[] }): Promise<ServiceResponse<any>> {
        try {
            const response = await fetch('/api/admin/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            
            // Intentar parsear como JSON, si falla (ej: error 500 HTML), capturar el error
            let data;
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }

            if (!response.ok) {
                const errorMessage = data?.details || data?.error || `Error en el servidor (${response.status})`;
                throw new Error(errorMessage);
            }
            
            return { data: data.user, error: null, success: true };
        } catch (error: any) {
            console.error('Error creating profile via API:', error);
            return { data: null, error: error.message || 'Error desconocido', success: false };
        }
    },

    // --- TEACHER RESOURCES MANAGEMENT ---

    async getResourceCategories(): Promise<ServiceResponse<any[]>> {
        const { data, error } = await supabase
            .from('recurso_categorias')
            .select('*')
            .order('orden', { ascending: true });
        return { data, error, success: !error };
    },

    async saveResourceCategory(category: any): Promise<ServiceResponse<any>> {
        if (category.id) {
            const { data, error } = await supabase
                .from('recurso_categorias')
                .update(category)
                .eq('id', category.id)
                .select()
                .single();
            return { data, error, success: !error };
        } else {
            const { data, error } = await supabase
                .from('recurso_categorias')
                .insert(category)
                .select()
                .single();
            return { data, error, success: !error };
        }
    },

    async deleteResourceCategory(id: string): Promise<ServiceResponse<any>> {
        const { error } = await supabase
            .from('recurso_categorias')
            .delete()
            .eq('id', id);
        return { data: null, error, success: !error };
    },

    async getTeacherResources(categoriaId?: string): Promise<ServiceResponse<any[]>> {
        let query = supabase
            .from('recursos_docente')
            .select('*, recurso_categorias(nombre)')
            .order('created_at', { ascending: false });
        
        if (categoriaId && categoriaId !== 'all') {
            query = query.eq('categoria_id', categoriaId);
        }

        const { data, error } = await query;
        return { data, error, success: !error };
    },

    async saveTeacherResource(resource: any): Promise<ServiceResponse<any>> {
        if (resource.id) {
            const { data, error } = await supabase
                .from('recursos_docente')
                .update(resource)
                .eq('id', resource.id)
                .select()
                .single();
            return { data, error, success: !error };
        } else {
            const { data, error } = await supabase
                .from('recursos_docente')
                .insert(resource)
                .select()
                .single();
            return { data, error, success: !error };
        }
    },

    async deleteTeacherResource(id: string): Promise<ServiceResponse<any>> {
        const { error } = await supabase
            .from('recursos_docente')
            .delete()
            .eq('id', id);
        return { data: null, error, success: !error };
    }
};

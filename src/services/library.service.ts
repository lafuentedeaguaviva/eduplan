/**
 * Model: LibraryService
 * 
 * Este servicio actúa como la capa de acceso a datos (Model) para la Biblioteca de contenidos.
 * Se encarga de las consultas a Supabase y la lógica de persistencia de contenidos base y de usuario.
 */

import { supabase } from '@/lib/supabase';
import { ServiceResponse, ContentItem, UserContent } from '@/types';
export const LibraryService = {
    /**
     * Busca contenidos base filtrando por texto y área de conocimiento opcional.
     * @param {string} query - Término de búsqueda.
     * @param {number} areaConocimientoId - ID opcional del área de conocimiento.
     * @returns {Promise<ServiceResponse<ContentItem[]>>} Lista de contenidos encontrados.
     */
    async searchContents(query: string = '', areaConocimientoId?: number): Promise<ServiceResponse<ContentItem[]>> {
        let queryBuilder = supabase
            .from('contenidos_base')
            .select(`
                id,
                titulo,
                trimestre,
                area_conocimiento:areas_conocimiento(
                    id,
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre)
                    )
                )
            `)
            .limit(50);

        if (query) {
            queryBuilder = queryBuilder.ilike('titulo', `%${query}%`);
        }

        if (areaConocimientoId) {
            queryBuilder = queryBuilder.eq('area_conocimiento_id', areaConocimientoId);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error searching library:', error);
            return { data: [], error, success: false };
        }

        const mapped = (data || []).map((item: any) => ({
            ...item,
            is_base: true
        })) as ContentItem[];

        return { data: mapped, error: null, success: true };
    },

    /**
     * Busca contenidos propios del usuario (contenidos_usuario).
     * @param {string} query - Término de búsqueda.
     * @param {string} userId - ID del profesor.
     * @param {string} areaTrabajoId - Opcional. Filtrar por una clase específica.
     * @returns {Promise<ServiceResponse<ContentItem[]>>} Lista de contenidos encontrados adaptados al formato ContentItem.
     */
    async searchUserContents(query: string = '', userId: string, areaTrabajoId?: string | null): Promise<ServiceResponse<ContentItem[]>> {
        // Obtenemos primero las áreas del usuario para evitar problemas de join en Supabase
        const { data: userAreas, error: areasError } = await supabase
            .from('areas_trabajo')
            .select('id')
            .eq('profesor_id', userId);

        if (areasError) {
            console.error('Error fetching user areas:', areasError);
            return { data: [], error: areasError, success: false };
        }
        
        if (!userAreas || userAreas.length === 0) {
            return { data: [], error: null, success: true };
        }

        const areaIds = userAreas.map(a => a.id);

        let queryBuilder = supabase
            .from('contenidos_usuario')
            .select(`
                id,
                titulo,
                padre_id,
                orden,
                area_trabajo_id,
                origen_base:contenidos_base(
                    trimestre
                ),
                area_trabajo:areas_trabajo(
                    id,
                    profesor_id,
                    area_conocimiento:areas_conocimiento(
                        id,
                        nombre,
                        grado:grados(
                            id,
                            nombre,
                            nivel:niveles(id, nombre)
                        )
                    )
                )
            `)
            .in('area_trabajo_id', areaIds)
            .limit(50);

        if (query) {
            queryBuilder = queryBuilder.ilike('titulo', `%${query}%`);
        }

        if (areaTrabajoId) {
            queryBuilder = queryBuilder.eq('area_trabajo_id', areaTrabajoId);
        }

        const { data, error } = await queryBuilder;

        if (error) {
            console.error('Error searching user contents:', error);
            return { data: [], error, success: false };
        }

        const mapped = (data || []).map((item: any) => ({
            id: item.id,
            titulo: item.titulo,
            trimestre: item.origen_base?.trimestre,
            padre_id: item.padre_id,
            orden: item.orden,
            area_conocimiento: item.area_trabajo?.area_conocimiento,
            is_base: false,
            area_trabajo_id: item.area_trabajo_id
        })) as ContentItem[];

        return { data: mapped, error: null, success: true };
    },

    /**
     * Obtiene los contenidos base asociados a un área de conocimiento específica.
     * @param {number} areaConocimientoId - ID del área de conocimiento.
     * @returns {Promise<ServiceResponse<ContentItem[]>>} Lista de contenidos base.
     */
    async getBaseContentsByArea(areaConocimientoId: number): Promise<ServiceResponse<ContentItem[]>> {
        const { data, error } = await supabase
            .from('contenidos_base')
            .select(`
                id,
                titulo,
                padre_id,
                orden,
                trimestre,
                area_conocimiento:areas_conocimiento(
                    id,
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre)
                    )
                )
            `)
            .eq('area_conocimiento_id', areaConocimientoId)
            .order('orden', { ascending: true })
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching base contents by area:', error);
            return { data: [], error, success: false };
        }

        const mapped = (data || []).map((item: any) => ({
            ...item,
            is_base: true
        })) as ContentItem[];

        return { data: mapped, error: null, success: true };
    },

    /**
     * Obtiene los contenidos personalizados de un usuario para un área de trabajo.
     * @param {string} areaTrabajoId - ID del área de trabajo.
     * @returns {Promise<ServiceResponse<UserContent[]>>} Lista de contenidos del usuario.
     */
    async getUserContents(areaTrabajoId: string): Promise<ServiceResponse<UserContent[]>> {
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .select('*, origen_base:contenidos_base(id, trimestre)')
            .eq('area_trabajo_id', areaTrabajoId)
            .order('orden', { ascending: true })
            .order('id', { ascending: true });

        if (error) {
            console.error('Error fetching user contents:', error);
            return { data: [], error, success: false };
        }

        return { data: data as UserContent[], error: null, success: true };
    },

    /**
     * Copia un contenido base al repositorio personalizado del usuario (Auto-ID).
     * Preserva la jerarquía si el padre ya existe en el repositorio del usuario. 
     * @param {number} baseContentId - ID del contenido base.
     * @param {string} areaTrabajoId - ID del área de trabajo destino.
     * @returns {Promise<ServiceResponse<any>>} Respuesta del servicio.
     */
    async copyContentToUser(baseContentId: number, areaTrabajoId: string): Promise<ServiceResponse<any>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No authenticated session' };

        // 1. Check if already exists to avoid duplicates
        const { data: existing } = await supabase
            .from('contenidos_usuario')
            .select('*')
            .eq('area_trabajo_id', areaTrabajoId)
            .eq('origen_base_id', String(baseContentId))
            .limit(1);
        
        if (existing && existing.length > 0) {
            return { success: true, data: existing[0], error: null };
        }

        // 2. Get base content details
        const { data: baseContent } = await supabase
            .from('contenidos_base')
            .select('*')
            .eq('id', Number(baseContentId))
            .single();

        if (!baseContent) return { success: false, data: null, error: 'Base content not found' };

        // 3. Prepare manual ID assignment
        const { data: maxId } = await supabase.rpc('get_max_user_content_id');
        let nextId = Number(maxId || 0);

        // 4. Handle hierarchy recursively upwards (Resolve all ancestors)
        const missingAncestors = [];
        let currentBaseParentId = baseContent.padre_id;
        
        while (currentBaseParentId !== null && currentBaseParentId !== undefined) {
            // Does this ancestor already exist in the user's workspace?
            const { data: existingAncestor } = await supabase
                .from('contenidos_usuario')
                .select('id')
                .eq('area_trabajo_id', areaTrabajoId)
                .eq('origen_base_id', String(currentBaseParentId))
                .limit(1);

            if (existingAncestor && existingAncestor.length > 0) {
                // We found a connecting point. Stop traversing.
                break;
            }

            // Fetch the missing ancestor from base
            const { data: baseAncestor } = await supabase
                .from('contenidos_base')
                .select('*')
                .eq('id', Number(currentBaseParentId))
                .single();

            if (!baseAncestor) break;

            missingAncestors.push(baseAncestor);
            currentBaseParentId = baseAncestor.padre_id;
        }

        // missingAncestors is ordered from immediate parent -> root. We must insert root -> immediate parent.
        missingAncestors.reverse();

        let lastInsertedUserParentId: string | number | null = null;

        if (missingAncestors.length > 0) {
            // We need to link the highest missing ancestor to its existing parent in the user workspace (if any)
            let highestMissingAncestorParentIdInUser: string | number | null = null;
            const topAncestorBaseParentId = missingAncestors[0].padre_id;
            
            if (topAncestorBaseParentId !== null && topAncestorBaseParentId !== undefined) {
                const { data: rootParentInUser } = await supabase
                    .from('contenidos_usuario')
                    .select('id')
                    .eq('area_trabajo_id', areaTrabajoId)
                    .eq('origen_base_id', String(topAncestorBaseParentId))
                    .limit(1);
                
                if (rootParentInUser && rootParentInUser.length > 0) {
                    highestMissingAncestorParentIdInUser = rootParentInUser[0].id;
                }
            }

            let currentParentIdForInsert = highestMissingAncestorParentIdInUser;

            for (const p of missingAncestors) {
                nextId++;
                const newId = nextId;
                await supabase
                    .from('contenidos_usuario')
                    .insert({
                        id: newId,
                        area_trabajo_id: areaTrabajoId,
                        origen_base_id: String(p.id),
                        padre_id: currentParentIdForInsert ? String(currentParentIdForInsert) : null,
                        titulo: p.titulo,
                        orden: p.orden
                    });
                currentParentIdForInsert = newId;
            }
            lastInsertedUserParentId = currentParentIdForInsert;

        } else {
            // No ancestors missing, so the immediate parent MUST exist in user DB (if baseContent has a parent)
            if (baseContent.padre_id !== null && baseContent.padre_id !== undefined) {
                const { data: existingParent } = await supabase
                    .from('contenidos_usuario')
                    .select('id')
                    .eq('area_trabajo_id', areaTrabajoId)
                    .eq('origen_base_id', String(baseContent.padre_id))
                    .limit(1);
                
                if (existingParent && existingParent.length > 0) {
                    lastInsertedUserParentId = existingParent[0].id;
                }
            }
        }

        // 5. Create user content
        nextId++;
        const newChildId = nextId;
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
                id: newChildId,
                area_trabajo_id: areaTrabajoId,
                origen_base_id: String(baseContentId),
                padre_id: lastInsertedUserParentId ? String(lastInsertedUserParentId) : null,
                titulo: baseContent.titulo,
                orden: baseContent.orden
            })
            .select()
            .single();

        return { success: !error, data, error };
    },

    async updateUserContent(id: number, updates: { titulo?: string }): Promise<ServiceResponse<{ updated: boolean; count: number }>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: { updated: false, count: 0 }, error: 'No authenticated session' };

        const { error, count } = await supabase
            .from('contenidos_usuario')
            .update(updates)
            .eq('id', id);

        return { success: !error, data: { updated: !error, count: count || 0 }, error };
    },

    async deleteUserContent(id: number): Promise<ServiceResponse<any>> {
        const { error } = await supabase
            .from('contenidos_usuario')
            .delete()
            .eq('id', id);

        return { success: !error, data: null, error };
    },

    async clearUserContents(areaTrabajoId: string): Promise<ServiceResponse<any>> {
        const { error } = await supabase
            .from('contenidos_usuario')
            .delete()
            .eq('area_trabajo_id', areaTrabajoId);

        return { success: !error, data: null, error };
    },

    async createCustomContent(areaTrabajoId: string, titulo: string): Promise<ServiceResponse<UserContent>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No session' };

        const { data: maxOrderData } = await supabase
            .from('contenidos_usuario')
            .select('orden')
            .eq('area_trabajo_id', areaTrabajoId)
            .is('padre_id', null)
            .order('orden', { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextOrder = (maxOrderData?.orden || 0) + 1;

        const { data: maxId } = await supabase.rpc('get_max_user_content_id');
        const nextId = (Number(maxId) || 0) + 1;

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
                id: nextId,
                area_trabajo_id: areaTrabajoId,
                titulo,
                orden: nextOrder
            })
            .select()
            .single();

        return { success: !error, data: data as UserContent, error };
    },

    async createCustomSubtheme(areaTrabajoId: string, padreId: number, titulo: string): Promise<ServiceResponse<UserContent>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No session' };

        const { data: maxOrderData } = await supabase
            .from('contenidos_usuario')
            .select('orden')
            .eq('padre_id', padreId)
            .order('orden', { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextOrder = (maxOrderData?.orden || 0) + 1;

        const { data: maxId } = await supabase.rpc('get_max_user_content_id');
        const nextId = (Number(maxId) || 0) + 1;

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
                id: nextId,
                area_trabajo_id: areaTrabajoId,
                padre_id: padreId,
                titulo,
                orden: nextOrder
            })
            .select()
            .single();

        return { success: !error, data: data as UserContent, error };
    },

    async reorderUserContent(id1: number, newOrder1: number, id2: number, newOrder2: number): Promise<ServiceResponse<any>> {
        const { error: error1 } = await supabase
            .from('contenidos_usuario')
            .update({ orden: newOrder1 })
            .eq('id', id1);

        const { error: error2 } = await supabase
            .from('contenidos_usuario')
            .update({ orden: newOrder2 })
            .eq('id', id2);

        return { success: !error1 && !error2, data: null, error: error1 || error2 };
    },

    /**
     * Sincroniza TODOS los contenidos base al repositorio del usuario (Auto-ID Masivo).
     * @param {number} areaConocimientoId - ID del área de conocimiento a sincronizar.
     * @param {string} areaTrabajoId - ID del área de trabajo destino.
     * @returns {Promise<ServiceResponse<any>>} Respuesta del servicio.
     */
    async copyAllBaseContentsToUser(areaConocimientoId: number, areaTrabajoId: string): Promise<ServiceResponse<any>> {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return { success: false, data: null, error: 'No authenticated session' };

        try {
            // 0. Explicit RLS/Ownership Check
            const { data: areaCheck, error: areaCheckError } = await supabase
                .from('areas_trabajo')
                .select('id, profesor_id')
                .eq('id', areaTrabajoId)
                .single();

            if (areaCheckError || !areaCheck) {
                throw new Error(`RLS_FAILURE: No access to area ${areaTrabajoId}`);
            }
            
            // 0.5 Clean up existing contents
            const { error: clearError } = await supabase
                .from('contenidos_usuario')
                .delete()
                .eq('area_trabajo_id', areaTrabajoId);
            
            if (clearError) throw clearError;

            // 1. Fetch base contents
            const { data: baseContents, error: fetchError } = await supabase
                .from('contenidos_base')
                .select('*')
                .eq('area_conocimiento_id', areaConocimientoId)
                .order('orden', { ascending: true })
                .order('id', { ascending: true });

            if (fetchError) throw fetchError;
            if (!baseContents || baseContents.length === 0) return { success: true, data: [], error: null };

            // 2. Prepare manual ID assignment (Pattern from src1 to bypass RLS mapping issues)
            const { data: maxId, error: rpcError } = await supabase.rpc('get_max_user_content_id');
            if (rpcError) throw rpcError;
            let currentNextId = Number(maxId || 0);

            // 3. Pre-map ALL new IDs to support N-level hierarchy
            const idMap = new Map<string, number>();
            baseContents.forEach(c => {
                currentNextId++;
                idMap.set(String(c.id), currentNextId);
            });

            // 4. Build items to insert with re-mapped padre_id
            const itemsToInsert = baseContents.map(c => {
                const newId = idMap.get(String(c.id));
                const basePadreId = (c.padre_id !== null && c.padre_id !== undefined) ? String(c.padre_id) : null;
                const userPadreId = basePadreId ? idMap.get(basePadreId) : null;

                return {
                    id: newId,
                    area_trabajo_id: areaTrabajoId,
                    origen_base_id: String(c.id),
                    padre_id: userPadreId ? String(userPadreId) : null,
                    titulo: c.titulo,
                    orden: c.orden || 1 // Preserve original order if exists
                };
            });

            // 5. Insert all mapped items in a single bulk operation
            // This ensures PostgreSQL validates all foreign keys at the end of the statement,
            // preventing issues if a child appears before its parent in the array.
            const { error: insertError } = await supabase
                .from('contenidos_usuario')
                .insert(itemsToInsert);

            if (insertError) throw insertError;

            return { success: true, data: null, error: null };
        } catch (error: any) {
            console.error('--- CRITICAL SYNC ERROR ---', error);
            return { 
                success: false, 
                data: null,
                error: { message: error?.message || 'Error en sincronización' }
            };
        }
    }
};

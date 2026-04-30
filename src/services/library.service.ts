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

        // 1. Get base content details
        const { data: baseContent } = await supabase
            .from('contenidos_base')
            .select('*')
            .eq('id', baseContentId)
            .single();

        if (!baseContent) return { success: false, data: null, error: 'Base content not found' };

        // 2. Preserve hierarchy
        let userPadreId = null;
        if (baseContent.padre_id) {
            const { data: existingUserPadre } = await supabase
                .from('contenidos_usuario')
                .select('id')
                .eq('area_trabajo_id', areaTrabajoId)
                .eq('origen_base_id', baseContent.padre_id)
                .single();

            if (existingUserPadre) userPadreId = existingUserPadre.id;
        }

        // 3. Create user content (Auto-ID via DB sequence)
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
                area_trabajo_id: areaTrabajoId,
                origen_base_id: baseContentId,
                padre_id: userPadreId,
                titulo: baseContent.titulo,
                orden: baseContent.orden
            })
            .select()
            .single();

        return { success: !error, data, error };
    },

    async updateUserContent(id: number, updates: { titulo?: string }): Promise<ServiceResponse<{ updated: boolean; count: number }>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No authenticated session' };

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) {
            console.error('Error updating user content:', error);
            return { success: false, data: null, error };
        }

        const count = data?.length || 0;
        return { success: count > 0, data: { updated: count > 0, count }, error: null };
    },

    async deleteUserContent(id: number): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .delete()
            .eq('id', id)
            .select();

        return { success: !error, data, error };
    },

    async clearUserContents(areaTrabajoId: string): Promise<ServiceResponse<any>> {
        const { data, error } = await supabase
            .from('contenidos_usuario')
            .delete()
            .eq('area_trabajo_id', areaTrabajoId)
            .select();

        if (error) {
            console.error('Error clearing user contents:', error);
            return { success: false, data: null, error };
        }
        return { success: true, data, error: null };
    },

    async createCustomContent(areaTrabajoId: string, titulo: string): Promise<ServiceResponse<UserContent>> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, data: null, error: 'No session' };

        // Get max order
        const { data: maxOrderData } = await supabase
            .from('contenidos_usuario')
            .select('orden')
            .eq('area_trabajo_id', areaTrabajoId)
            .is('padre_id', null)
            .order('orden', { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextOrder = (maxOrderData?.orden || 0) + 1;

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
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

        // Get max order
        const { data: maxOrderData } = await supabase
            .from('contenidos_usuario')
            .select('orden')
            .eq('padre_id', padreId)
            .order('orden', { ascending: false })
            .limit(1)
            .maybeSingle();

        const nextOrder = (maxOrderData?.orden || 0) + 1;

        const { data, error } = await supabase
            .from('contenidos_usuario')
            .insert({
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
            console.log(`Checking access for User:${userId} on Area:${areaTrabajoId}`);
            const { data: areaCheck, error: areaCheckError } = await supabase
                .from('areas_trabajo')
                .select('id, profesor_id')
                .eq('id', areaTrabajoId)
                .single();

            if (areaCheckError || !areaCheck) {
                throw new Error(`RLS_FAILURE: No access to area ${areaTrabajoId}. Details: ${JSON.stringify(areaCheckError)}`);
            }
            
            console.log('Access verified. Owner matches:', areaCheck.profesor_id === userId);

            // 1. Fetch base contents
            const { data: baseContents, error: fetchError } = await supabase
                .from('contenidos_base')
                .select('*')
                .eq('area_conocimiento_id', areaConocimientoId)
                .order('orden', { ascending: true })
                .order('id', { ascending: true });

            if (fetchError) throw fetchError;
            if (!baseContents || baseContents.length === 0) return { success: true, data: [], error: null };

            // 2. Separate Parents and Children
            const parents = baseContents.filter(c => !c.padre_id);
            const children = baseContents.filter(c => c.padre_id);
            const idMap = new Map<number, number>();

            // 3. STEP 1: Parents (Themes)
            if (parents.length > 0) {
                const parentsToInsert = parents.map((p, pIdx) => ({
                    area_trabajo_id: areaTrabajoId,
                    origen_base_id: p.id,
                    titulo: p.titulo,
                    orden: pIdx + 1 // Sequential order for themes
                }));

                const { data: insertedParents, error: parentError } = await supabase
                    .from('contenidos_usuario')
                    .insert(parentsToInsert)
                    .select('id, origen_base_id');

                if (parentError) throw parentError;
                insertedParents?.forEach(p => {
                    if (p.origen_base_id) idMap.set(p.origen_base_id, p.id);
                });
            }

            // 4. STEP 2: Children (Subthemes)
            if (children.length > 0) {
                // Group children by parent to assign sequential order per theme
                const childrenToInsert: any[] = [];
                const parentOrderCounters = new Map<number, number>();

                children.forEach(c => {
                    const userPadreId = c.padre_id ? idMap.get(c.padre_id) : null;
                    if (userPadreId) {
                        const currentOrder = (parentOrderCounters.get(userPadreId) || 0) + 1;
                        parentOrderCounters.set(userPadreId, currentOrder);

                        childrenToInsert.push({
                            area_trabajo_id: areaTrabajoId,
                            origen_base_id: c.id,
                            padre_id: userPadreId,
                            titulo: c.titulo,
                            orden: currentOrder
                        });
                    }
                });

                if (childrenToInsert.length > 0) {
                    const { error: childError } = await supabase
                        .from('contenidos_usuario')
                        .insert(childrenToInsert);

                    if (childError) throw childError;
                }
            }

            return { success: true, data: null, error: null };
        } catch (error: any) {
            console.error('--- CRITICAL SYNC ERROR DETECTED ---');
            console.error('Error Code:', error?.code || error?.status || 'N/A');
            console.error('Error Message:', error?.message || 'N/A');
            console.error('Error Details:', error?.details || 'N/A');
            console.error('Error Hint:', error?.hint || 'N/A');
            console.dir(error); // This shows the interactive object in the browser
            
            return { 
                success: false, 
                data: null,
                error: { 
                    message: error?.message || 'Error desconocido en sincronización',
                    code: error?.code || 'UNKNOWN',
                    details: `${error?.details || ''} ${error?.hint || ''}`.trim()
                }
            };
        }
    }
};

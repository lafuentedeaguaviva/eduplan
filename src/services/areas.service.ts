/**
 * Model: AreasService
 * 
 * Este servicio gestiona las Áreas de Trabajo, que representan la relación entre un
 * Profesor, una Unidad Educativa y un Área de Conocimiento.
 */

import { db } from '@/lib/database';
import { ServiceResponse, AreaTrabajo } from '@/types';

/**
 * Catálogos básicos para la configuración de áreas.
 */
export interface Catalogs {
    unidades: { id: number; nombre: string; }[];
    areas: { id: number; nombre: string; }[];
    turnos: { id: string; nombre: string; }[];
    paralelos: { id: string; nombre: string; }[];
}

export const AreasService = {
    /**
     * Obtiene todas las áreas de trabajo asociadas a un profesor.
     * @param {string} userId - ID del profesor (UUID de Auth).
     * @returns {Promise<AreaTrabajo[]>} Lista de áreas con paralelos cargados.
     */
    async getAreas(userId: string): Promise<ServiceResponse<AreaTrabajo[]>> {
        const { data, error } = await db.from('areas_trabajo')
            .select(`
                id,
                profesor_id,
                unidad_educativa:unidades_educativas(id, nombre),
                area_conocimiento:areas_conocimiento(
                    id, 
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre, objetivo_holistico)
                    )
                ),
                turno:turnos(id, nombre),
                created_at
            `)
            .eq('profesor_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching areas:', error);
            return { data: [], error, success: false };
        }

        const areasWithParalelos = await Promise.all(data.map(async (area: any) => {
            const { data: paralelosData } = await db.from('area_trabajo_paralelo')
                .select('paralelo:paralelos(id, nombre)')
                .eq('area_trabajo_id', area.id);

            return {
                ...area,
                paralelos: paralelosData?.map((p: any) => p.paralelo) || []
            };
        }));

        return { data: areasWithParalelos as unknown as AreaTrabajo[], error: null, success: true };
    },

    /**
     * Obtiene los catálogos necesarios para configurar un área.
     * @returns {Promise<Catalogs>} Objeto con listas de unidades, áreas, turnos y paralelos.
     */
    async getCatalogs(): Promise<Catalogs> {
        const [unidades, areas, turnos, paralelos] = await Promise.all([
            db.from('unidades_educativas').select('id, nombre'),
            db.from('areas_conocimiento').select('id, nombre'),
            db.from('turnos').select('id, nombre'),
            db.from('paralelos').select('id, nombre').order('nombre')
        ]);

        return {
            unidades: unidades.data || [],
            areas: areas.data || [],
            turnos: turnos.data || [],
            paralelos: paralelos.data || []
        };
    },

    /**
     * Crea una nueva área de trabajo para un profesor.
     * @param {Object} data - Datos de creación.
     * @returns {Promise<ServiceResponse<any>>} El área creada o el error.
     */
    async createArea(data: {
        profesor_id: string;
        unidad_educativa_id: number;
        area_conocimiento_id: number;
        turno_id: string;
        paralelos_ids: string[];
    }): Promise<ServiceResponse<any>> {
        const { data: area, error: areaError } = await db.from('areas_trabajo')
            .insert({
                profesor_id: data.profesor_id,
                unidad_educativa_id: data.unidad_educativa_id,
                area_conocimiento_id: data.area_conocimiento_id,
                turno_id: data.turno_id
            })
            .select()
            .single();

        if (areaError) {
            if (areaError.code !== '23505') {
                console.error('AreasService.createArea - areaError:', areaError);
            }
            return { data: null, error: areaError, success: false };
        }

        if (data.paralelos_ids.length > 0) {
            const paralelosInserts = data.paralelos_ids.map(pid => ({
                area_trabajo_id: area.id,
                paralelo_id: pid
            }));

            const { error: paralelosError } = await db.from('area_trabajo_paralelo')
                .insert(paralelosInserts);

            if (paralelosError) {
                console.error('AreasService.createArea - paralelosError:', paralelosError);
                return { data: area, error: paralelosError, success: false };
            }
        }

        return { data: area, error: null, success: true };
    },

    /**
     * Actualiza la configuración de un área de trabajo existente.
     * @param {string} id - ID del área.
     * @param {Object} data - Nuevos datos.
     * @returns {Promise<ServiceResponse<any>>} El área actualizada o el error.
     */
    async updateArea(id: string, data: {
        unidad_educativa_id: number;
        area_conocimiento_id: number;
        turno_id: string;
        paralelos_ids: string[];
    }): Promise<ServiceResponse<any>> {
        const { error: areaError } = await db.from('areas_trabajo')
            .update({
                unidad_educativa_id: data.unidad_educativa_id,
                area_conocimiento_id: data.area_conocimiento_id,
                turno_id: data.turno_id
            })
            .eq('id', id);

        if (areaError) {
            if (areaError.code !== '23505') {
                console.error('AreasService.updateArea - areaError:', areaError);
            }
            return { data: null, error: areaError, success: false };
        }

        const { error: deleteError } = await db.from('area_trabajo_paralelo')
            .delete()
            .eq('area_trabajo_id', id);

        if (deleteError) {
            console.error('Error in updateArea (delete area_trabajo_paralelo):', deleteError);
            return { data: null, error: deleteError, success: false };
        }

        if (data.paralelos_ids.length > 0) {
            const paralelosInserts = data.paralelos_ids.map(pid => ({
                area_trabajo_id: id,
                paralelo_id: pid
            }));

            const { error: paralelosError } = await db.from('area_trabajo_paralelo')
                .insert(paralelosInserts);

            if (paralelosError) {
                console.error('Error in updateArea (area_trabajo_paralelo):', paralelosError);
                return { data: null, error: paralelosError, success: false };
            }
        }

        return { data: { id, ...data }, error: null, success: true };
    },

    /**
     * Elimina un área de trabajo permanentemente.
     * @param {string} id - ID del área.
     * @returns {Promise<ServiceResponse<any>>} Estado de éxito.
     */
    async deleteArea(id: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db.from('areas_trabajo')
            .delete()
            .eq('id', id)
            .select();

        return { data, error, success: !error };
    },

    /**
     * Obtiene los detalles de un área específica por su ID.
     * @param {string} id - ID del área de trabajo.
     * @returns {Promise<AreaTrabajo | null>} El área con sus paralelos o null si no se encuentra.
     */
    async getAreaById(id: string): Promise<ServiceResponse<AreaTrabajo | null>> {
        const { data, error } = await db.from('areas_trabajo')
            .select(`
                id,
                profesor_id,
                unidad_educativa:unidades_educativas(
                    id, 
                    nombre,
                    distrito:distritos(
                        id,
                        nombre,
                        departamento:departamentos(id, nombre)
                    )
                ),
                area_conocimiento:areas_conocimiento(
                    id, 
                    nombre,
                    grado:grados(
                        id,
                        nombre,
                        nivel:niveles(id, nombre, objetivo_holistico)
                    )
                ),
                turno:turnos(id, nombre),
                created_at
            `)
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error fetching area by id:', error);
            return { data: null, error, success: false };
        }

        const { data: paralelosData } = await db.from('area_trabajo_paralelo')
            .select('paralelo:paralelos(id, nombre)')
            .eq('area_trabajo_id', data.id);

        const area = {
            ...data,
            paralelos: paralelosData?.map((p: any) => p.paralelo) || []
        } as unknown as AreaTrabajo;

        return { data: area, error: null, success: true };
    },

    /**
     * Obtiene una lista de contenidos por sus IDs.
     */
    async getContentsByIds(ids: number[]): Promise<ServiceResponse<any[]>> {
        const { data, error } = await db
            .from('contenidos_usuario')
            .select('*')
            .in('id', ids)
            .order('padre_id', { ascending: false, nullsFirst: true })
            .order('orden', { ascending: true });
        return { data: data || [], error, success: !error };
    },

    /**
     * Obtiene TODOS los contenidos asociados a un área de trabajo específica.
     */
    async getAreaContents(areaId: string): Promise<ServiceResponse<any[]>> {
        const { data, error } = await db
            .from('contenidos_usuario')
            .select('*')
            .eq('area_trabajo_id', areaId)
            .order('padre_id', { ascending: true, nullsFirst: true })
            .order('orden', { ascending: true });
        return { data: data || [], error, success: !error };
    }
};


/**
 * Domain Models & Types - EduPlan Pro
 * Prime Directive: Atomic, explicable and non-destructive.
 */

export interface ServiceResponse<T> {
    data: T | null;
    error: any | null;
    success: boolean;
}

export * from './database';

export interface Profile {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    nombre_completo?: string;
    rol?: string;
    titulo?: string;
    created_at?: string;
}

export type PdcProfile = Profile;

export interface UserProfile {
    id: string;
    email: string;
    nombre_completo: string;
    roles?: string[];
    unidad_educativa_id?: number;
}

// --- Infrastructure ---

export interface UnidadEducativa {
    id: number;
    nombre: string;
    distrito?: {
        id: number;
        nombre: string;
        departamento?: { id: number; nombre: string; }
    }
}

export interface Grado {
    id: number;
    nombre: string;
    nivel?: { id: number; nombre: string; objetivo_holistico?: string; }
}

export interface AreaConocimiento {
    id: number;
    nombre: string;
    grado?: Grado;
}

export interface AreaTrabajo {
    id: string;
    profesor_id: string;
    unidad_educativa_id?: number;
    area_conocimiento_id?: number;
    turno_id?: string;
    pdc_area_trabajo_id?: string | null;
    director_id?: string | null;
    unidad_educativa: UnidadEducativa;
    area_conocimiento: AreaConocimiento;
    turno: { id: string; nombre: string; };
    paralelos: { id: string; nombre: string; }[];
    director?: Profile;
    created_at?: string;
}

// --- Content & Curriculum ---

export interface PlanificacionGeneral {
    id: number;
    gestion: number;
    trimestre: number;
    mes: number;
    semana: number;
    fecha_inicio_trimestre: string;
    fecha_fin_trimestre: string;
    fecha_inicio_mes?: string;
    fecha_fin_mes?: string;
    fecha_inicio_semana?: string;
    fecha_fin_semana?: string;
}

export interface ContentItem {
    id: number;
    titulo: string;
    padre_id?: number | null;
    orden: number;
    descripcion?: string;
    trimestre?: string;
    area_conocimiento?: AreaConocimiento;
    is_base: boolean;
}

export interface UserContent {
    id: number;
    area_trabajo_id?: string;
    origen_base_id?: number | null;
    padre_id?: number | null;
    titulo: string;
    orden: number;
    trimestre?: string;
    origen_base?: { trimestre: string };
    created_at?: string;
    updated_at?: string;
}

export interface MaterialContenido {
    id: string;
    docente_id: string;
    area_trabajo_id?: string;
    tema_padre_id?: number;
    titulo_tema: string;
    subtemas_incluidos?: any;
    pdc_revision_id?: string;
    config_usada?: any;
    cuerpo_contenido: string;
    estado: 'Borrador' | 'Finalizado';
    created_at?: string;
    updated_at?: string;
}

// --- Planning ---

export interface PlanificacionSemanal {
    id: string;
    area_trabajo_id: string;
    gestion: number;
    trimestre: number;
    mes: number;
    semana: number;
    fecha_inicio_trimestre: string;
    fecha_fin_trimestre: string;
    fecha_inicio_mes?: string;
    fecha_fin_mes?: string;
    fecha_inicio_semana?: string;
    fecha_fin_semana?: string;
    observaciones_generales?: string;
    objetivos_aprendizaje?: string;
    objetivos_aprendizaje_ia?: string;
    momentos_ia?: string;
    momentos_original?: string;
    recursos_fuentes_ia?: string;
    recursos_fuentes_original?: string;
    adaptaciones_basicas_ia?: string;
    adaptaciones_basicas_original?: string;
    adaptaciones_especiales_ia?: string;
    adaptaciones_especiales_original?: string;
    momentos?: string | any[];
    recursos_fuentes?: string | any[];
    adaptaciones_basicas?: string | any[];
    adaptaciones_especiales?: string | any[];
    momentos_json?: any[];
    recursos_json?: any[];
    fuentes_json?: any[];
    adaptaciones_json?: any[];
    adaptacion_especial?: any[];
    semana_contenido?: SemanaContenido[];
    semana_contenido_hier?: HierarchyRoot[];
    consolidado?: number;
    created_at?: string;
    updated_at?: string;
}

export interface SemanaContenido {
    id: string;
    planificacion_semanal_id?: string;
    contenido_usuario_id: number;
    orden: number;
    estado: string;
    contenido_usuario?: UserContent;
}

export interface PDCMaster {
    id: string;
    nombre_pdc?: string;
    docente_id: string;
    tipo_pdc_id: number;
    estado: 'Pendiente' | 'Verificado' | 'Rechazado';
    director_id?: string;
    observaciones_director?: string;
    gestion: number;
    trimestre?: number;
    mes?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    producto_final?: string;
    periodo_semanal?: number;
    escritura_tipo_ia?: string;
    correccion_profundidad_ia?: string;
    evaluacion_tipo_ia?: string;
    ia_habilitado?: number;
    created_at?: string;
    updated_at?: string;
    areas_trabajo?: AreaTrabajo[];
}

export interface TipoFuente {
    id_tipo_fuente: number;
    tipo_fuente: string;
    descripcion?: string | null;
}

export type PDC = PDCMaster;
export type Pdc = PDCMaster;

// --- Wizard Catalog ---

export interface CatalogoVerbo {
    id: number;
    verbo: string;
    tipo_verbo_id: number;
    detalle_tipo?: string;
    dominio?: string;
    nivel_profundidad?: string;
    niveles_educativos?: string[];
    descripcion?: string;
}

export interface CatalogoComplemento {
    id: number;
    complemento: string;
    tipo_complemento_id: number | null;
    categoria: string | null;
    subcategoria: string | null;
    niveles_sugeridos: string[];
}

export interface LearningObjective {
    text: string;
    contentIds: number[];
}

// --- Pedagogical Moments ---

export interface BasePlanningDetail {
    planificacion_semanal_id?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PracticaLibraryItem {
    id_practica: number | string;
    nombre_practica: string;
    proposito?: string;
    tipo?: string;
    apto_para?: string;
    descripcion_concreta?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface PracticaItem extends BasePlanningDetail {
    id_practica?: number | string;
    codigo_biblioteca_practica?: number | string | null;
    nombre_practica: string;
    preguntas?: string;
    descripcion?: string;
    proposito?: string;
    tipo?: string;
    apto_para?: string;
    redactado?: string;
    descripcion_concreta?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface TeoriaLibraryItem {
    id_teoria: number | string;
    nombre_estrategia_teorica: string;
    proposito?: string;
    tipo?: string;
}

export interface TeoriaItem extends BasePlanningDetail {
    id_teoria?: number | string;
    codigo_biblioteca_teoria?: number | string | null;
    nombre_estrategia_teorica: string;
    proposito?: string;
    tipo?: string;
    apto_para?: string;
    redactado?: string;
    descripcion_concreta?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface ProduccionLibraryItem {
    id_produccion: number | string;
    nombre_produccion: string;
    descripcion_concreta?: string;
    nivel?: string;
    subnivel?: string;
    tipo?: string;
    apto_para?: string;
    instrumento?: string;
    proposito?: string;
}

export interface ProduccionItem extends BasePlanningDetail {
    id_produccion?: number | string;
    codigo_biblioteca_produccion?: number | string | null;
    nombre_produccion: string;
    nivel?: string;
    subnivel?: string;
    tipo?: string;
    apto_para?: string;
    redactado?: string;
    instrumento?: string;
    descripcion_concreta?: string;
    proposito?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface ValoracionLibraryItem {
    id_valoracion: number | string;
    categoria: string;
    subcategoria?: string;
    tipo?: string;
    apto_para?: string;
    preguntas?: string;
    instrumento?: string;
    redactado?: string;
}

export interface ValoracionItem extends BasePlanningDetail {
    id_valoracion?: number | string;
    codigo_biblioteca_valoracion?: number | string | null;
    categoria: string;
    subcategoria?: string;
    tipo?: string;
    apto_para?: string;
    preguntas?: string;
    instrumento?: string;
    redactado?: string;
    proposito?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface RecursoLibraryItem {
    id_recursos: number | string;
    tipo?: string;
    recursos?: string;
    redactado?: string;
    apto_para?: string;
    ejemplo?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface RecursoItem extends BasePlanningDetail {
    id_recursos?: number | string;
    codigo_biblioteca_recursos?: number | string | null;
    recursos?: string;
    redactado?: string;
    tipo?: string;
    proposito?: string;
    apto_para?: string;
    ejemplo?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface MiFuenteLibraryItem {
    id_mi_fuente: number | string;
    perfil_id?: string;
    tipo?: string | null;
    autor?: string;
    anio?: string;
    titulo_fuente?: string;
    url?: string;
    detalle?: string;
}

export interface MiFuenteItem extends BasePlanningDetail {
    id_fuente?: number | string;
    codigo_biblioteca_mi_fuente?: number | string | null;
    titulo_fuente?: string;
    autor?: string;
    anio?: string;
    url?: string;
    detalle?: string;
    tipo?: string;
}

export interface AdaptacionBasicaLibraryItem {
    id_adaptacion_basica: number | string;
    tipo?: string;
    situacion?: string;
    nombre_adaptacion?: string;
    descripcion_situacion?: string;
    apto_para?: string;
    redactado?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface AdaptacionBasicaItem extends BasePlanningDetail {
    id_adaptacion_basica?: number | string;
    codigo_biblioteca_adaptacion?: number | string | null;
    nombre_adaptacion?: string;
    tipo?: string;
    situacion?: string;
    descripcion_situacion?: string;
    apto_para?: string;
    redactado?: string;
    proposito?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

// --- Evaluation ---

export interface SerLibraryItem {
    id_ser: number | string;
    categoria: string;
    subcategoria: string;
    nombre_ser: string;
    redactado?: string;
    instrumento_sugerido?: string;
}

export interface ObjetivoEstrategico {
    id: number;
    pdc_area_trabajo_id: number;
    descripcion: string;
    descripcion_ia?: string;
    creado_en?: string;
    instrumento_sugerido?: string;
    codigo_biblioteca_ser?: number | string;
    created_at?: string;
}

export interface SerItem {
    id_ser?: number;
    pdc_area_trabajo_id: string;
    nombre_ser: string;
    redactado?: string;
    instrumento_sugerido?: string;
    codigo_biblioteca_ser?: number | string;
    created_at?: string;
}

export interface SaberLibraryItem {
    id_saber: number | string;
    nivel: string;
    subnivel: string;
    verbo_saber: string;
    redactado?: string;
    instrumento_sugerido?: string;
    evidencia?: string;
}

export interface SaberItem {
    id_saber?: number;
    pdc_area_trabajo_id: string;
    verbo_saber: string;
    redactado?: string;
    instrumento_sugerido?: string;
    evidencia?: string;
    codigo_biblioteca_saber?: number | string;
    created_at?: string;
}

export interface HacerLibraryItem {
    id_hacer: number | string;
    nivel: string;
    subnivel: string;
    verbo: string;
    redactado?: string;
    instrumento_sugerido?: string;
    producto?: string;
}

export interface HacerItem {
    id_hacer?: number;
    pdc_area_trabajo_id: string;
    verbo: string;
    redactado?: string;
    instrumento_sugerido?: string;
    producto?: string;
    codigo_biblioteca_hacer?: number | string;
    created_at?: string;
}

export interface AdaptacionEvaluacionLibraryItem {
    id_adaptacion_evaluacion: number | string;
    condicion: string;
    nombre_adaptacion: string;
    redactado?: string;
}

export interface AdaptacionEvaluacionItem {
    id_adaptacion_evaluacion?: number;
    pdc_area_trabajo_id: string;
    nombre_adaptacion: string;
    condicion?: string;
    redactado?: string;
    codigo_biblioteca_evaluacion_adaptaciones_especiales?: number | string;
    created_at?: string;
}

export interface CriteriosEvaluacion {
    ser: string;
    saber: string;
    hacer: string;
    decidir: string;
}

// --- Design State ---

export interface WeekDesign {
    momentos: {
        practica: PracticaItem[];
        teoria: TeoriaItem[];
        produccion: ProduccionItem[];
        valoracion: ValoracionItem[];
        adaptaciones: AdaptacionBasicaItem[];
        recursos: RecursoItem[];
        fuentes: MiFuenteItem[];
    };
    momentos_json?: any[];
    recursos_json?: any[];
    fuentes_json?: any[];
    adaptaciones_json?: any[];
    adaptacion_especial?: any[];
    consolidado?: number;
    criterios?: CriteriosEvaluacion;
}

export interface AreaDesignState {
    learningObjectives: LearningObjective[];
    generatorMode: 'auto' | 'manual';
    currentObjective: any;
    manualObjective: any;
    weekContentsMap: Record<number, UserContent[]>;
    availableContents: UserContent[];
    weekDesignState: Record<number, WeekDesign>;
    weekPlanningIds?: Record<number, string>;
    objetivoNivel?: string;
    finalProduct?: string;
    periodo_semanal?: number;
}

// --- Report & Export ---

export interface HierarchyRoot extends UserContent {
    children: (UserContent & { global_sub_index: number })[];
    global_index: number;
    present_as_root: boolean;
}

export interface FullReportArea {
    id: string;
    nombre: string;
    grado_nombre: string;
    objetivos_aprendizaje: string;
    objetivos_aprendizaje_ia?: string;
    criterios_evaluacion: string;
    criterios_evaluacion_ia?: string;
    adaptaciones_no_significativas: string;
    adaptaciones_no_significativas_ia?: string;
    adaptaciones_especiales_ia?: string;
    adaptaciones_especiales_original?: string;
    criterios_evaluacion_adaptaciones: string;
    criterios_evaluacion_adaptaciones_ia?: string;
    periodo_semanal: number;
    semanas: PlanificacionSemanal[];
}

export interface FullReportData {
    gestion: number;
    trimestre: number;
    mes: number;
    distritos: string;
    unidades: string;
    niveles: string;
    grados: string;
    areas: string;
    docente: string;
    docente_id: string;
    director: string;
    director_id: string;
    objetivo_holistico_nivel: string;
    producto_final?: string;
    areas_trabajo: FullReportArea[];
    bibliografia_global?: string;
}

// --- AI & UX Specific Types ---
export type TonoRedaccion =
    | 'Academico'
    | 'Reflexivo'
    | 'Dinamico';

export type NivelProfundidad = 'Sugerir moderadamente' | 'Refinar profundamente' | 'Solo correcciones';

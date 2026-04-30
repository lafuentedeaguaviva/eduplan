/**
 * Domain Models & Types
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
    rol?: string;
    titulo?: string;
    created_at?: string;
}

export type PdcProfile = Profile;

// --- Areas & Infrastructure ---

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
    pdc_area_trabajo_id?: string | null; // Relación 1:1 con su instancia de diseño
    unidad_educativa: UnidadEducativa;
    area_conocimiento: AreaConocimiento;
    turno: { id: string; nombre: string; };
    paralelos: { id: string; nombre: string; }[];
    created_at?: string;
}

// --- Library & Content ---

export interface ContentItem {
    /** ID único (64-bit) */
    id: number;
    titulo: string;
    /** ID del padre (64-bit) */
    padre_id?: number | null;
    orden: number;
    descripcion?: string;
    trimestre?: string;
    area_conocimiento?: AreaConocimiento;
    is_base: boolean;
}

export interface UserContent {
    /** ID único (64-bit) */
    id: number;
    area_trabajo_id?: string;
    /** ID del contenido base (64-bit) */
    origen_base_id?: number | null;
    /** ID del padre (64-bit) */
    padre_id?: number | null;
    titulo: string;
    orden: number;
    trimestre?: string;
    origen_base?: { trimestre: string };
    created_at?: string;
    updated_at?: string;
}


// --- PDC & Planning ---

export interface PlanificacionGeneral {
    id: number;
    gestion: number;
    trimestre: number;
    mes: number; // 1-3
    semana: number;
    fecha_inicio_trimestre: string;
    fecha_fin_trimestre: string;
}

export interface SemanaContenido {
    id: string;
    planificacion_semanal_id?: string;
    /** Referencia a contenido_usuario (64-bit) */
    contenido_usuario_id: number;
    orden: number;
    observaciones?: string;
    estado: string;
    contenido_usuario?: UserContent;
}

export interface PlanificacionSemanal {
    id: string;
    area_trabajo_id: string;
    gestion: number;
    trimestre: number;
    mes: number;
    semana: number;
    fecha_inicio_trimestre: string;
    fecha_fin_trimestre: string;
    observaciones_generales?: string;
    momentos_ia?: string;
    recursos_fuentes_ia?: string;
    adaptaciones_basicas_ia?: string;
    adaptaciones_especiales_ia?: string;
    momentos?: any[];
    recursos?: any[];
    fuentes?: any[];
    semana_contenido?: SemanaContenido[];
    semana_contenido_hier?: HierarchyRoot[]; // For reports
    adaptaciones_basicas?: any[];
    adaptacion_especial?: any[];
    created_at?: string;
    updated_at?: string;
}

// --- Nueva Estructura PDC (Maestra) ---

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
    periodo_semanal?: number;
    escritura_tipo_ia?: string;
    correccion_profundidad_ia?: string;
    evaluacion_tipo_ia?: string;
    created_at?: string;
    updated_at?: string;
    areas_trabajo?: AreaTrabajo[];
}

export interface PDCAreaTrabajo {
    id: string;
    pdc_id: string;
    periodo_semanal?: number;
    criterios_evaluacion_ia?: string;
    adaptaciones_no_significativas_ia?: string;
    criterios_evaluacion_adaptaciones_ia?: string;
    criterios_evaluacion?: any[];
    criterio_adptacion_evaluacion?: any[];
    created_at?: string;
    updated_at?: string;
    areas_trabajo?: AreaTrabajo;
}

export type PDC = PDCMaster;
export type Pdc = PDC;

// --- PDC Wizard & Design Structs ---

export interface CatalogoVerbo {
    id: number;
    verbo: string;
    tipo_verbo_id: number;
    dominio?: string;
    nivel_profundidad?: string;
    niveles_educativos?: string[];
    descripcion?: string;
    ejemplo_indicativo?: string;
}

export interface CatalogoComplemento {
    id: number;
    complemento: string;
    tipo_complemento_id: number | null;
    detalle_tipo?: string | null;
    descripcion?: string | null;
    categoria: string | null;
    subcategoria: string | null;
    niveles_sugeridos: string[];
    ejemplo_uso?: string | null;
}

export interface TheoryLibraryItem {
    id_teoria: number | string;
    codigo_biblioteca_teoria?: string;
    nombre_estrategia_teorica: string;
    proposito?: string;
    tipo?: string;
    apto_para?: string;
    descripcion_concreta?: string;
    redactado?: string;
    redactado_ia?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    created_at?: string;
    updated_at?: string;
}

export interface LearningObjective {
    text: string;
    contentIds: number[];
}

export interface MomentosFormativos {
    practica: PracticaItem[];
    teoria: TeoriaItem[];
    produccion: ProduccionItem[];
    valoracion: ValoracionItem[];
    adaptaciones: AdaptacionBasicaItem[];
    recursos: RecursoItem[];
    fuentes: MiFuenteItem[];
}

export interface CriteriosEvaluacion {
    ser: string;
    saber: string;
    hacer: string;
    decidir: string;
}

export interface WeekDesign {
    momentos: MomentosFormativos;
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
    currentObjective: {
        verboIds: number[];
        contentIds: number[];
        complementId: number | null;
        complement: string;
        draft: string;
        isManual: boolean;
    };
    manualObjective: {
        quiero: string;
        paraQue: string;
        medire: string;
    };
    weekContentsMap: Record<number, UserContent[]>;
    availableContents: UserContent[];
    weekDesignState: Record<number, WeekDesign>;
    weekPlanningIds?: Record<number, string>;
    objetivoNivel?: string;
    finalProduct?: string;
    periodo_semanal?: number;
}

// --- Planning Detail Interfaces (Phase 2 & 3) ---

export interface BasePlanningDetail {
    planificacion_semanal_id?: string; // Relation to planificacion_semanal.id
    created_at?: string;
    updated_at?: string;
}

export interface PracticaItem extends BasePlanningDetail {
    id_practica?: number | string;
    codigo_biblioteca_practica?: string;
    nombre_practica: string;
    proposito?: string;
    tipo?: string;
    apto_para?: string;
    redactado?: string;
    preguntas?: string;
    descripcion?: string;
    descripcion_concreta?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;

    // Compatibility for legacy or temporary objects
    detalle?: string;
}

export interface PracticaLibraryItem {
    id_practica: number | string;
    nombre_practica: string;
    proposito?: string;
    tipo?: string;
    apto_para?: string;
    descripcion_concreta?: string;
    preguntas?: string;
    redactado?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface TeoriaItem extends BasePlanningDetail {
    id_teoria?: number;
    codigo_biblioteca_teoria?: string;
    nombre_estrategia_teorica: string;
    proposito?: string;
    tipo?: string;
    apto_para?: string;
    descripcion_concreta?: string;
    redactado?: string;
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
    redactado?: string;
    instrumento?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface ProduccionItem extends BasePlanningDetail {
    id_produccion?: number | string;
    codigo_biblioteca_produccion?: string;
    nombre_produccion: string;
    descripcion_concreta?: string;
    nivel?: string;
    subnivel?: string;
    tipo?: string;
    apto_para?: string;
    redactado?: string;
    instrumento?: string;
    proposito?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

export interface ValoracionLibraryItem {
    id_valoracion: number | string;
    categoria: string;
    preguntas?: string;
    redactado?: string;
    instrumento?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    apto_para?: string;
}

export interface ValoracionItem extends BasePlanningDetail {
    id_valoracion?: number | string;
    codigo_biblioteca_valoracion?: number | string;
    categoria: string;
    subcategoria?: string;
    proposito?: string;
    preguntas?: string;
    redactado?: string;
    instrumento?: string;
    apto_para?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
}

// ─── Adaptaciones Básicas ─────────────────────────────────────────────────────

export interface AdaptacionBasicaLibraryItem {
    id_adaptacion_basica: number;
    tipo?: string;
    situacion?: string;
    nombre_adaptacion?: string;
    descripcion_situacion?: string;
    apto_para?: string;
    redactado?: string;
}

export interface AdaptacionBasicaItem extends BasePlanningDetail {
    id_adaptacion_basica?: number | string;
    planificacion_semanal_id?: string;
    tipo?: string;
    tipo_adaptacion?: string;  // alias legacy
    situacion?: string;
    descripcion_situacion?: string;
    nombre_adaptacion?: string;
    apto_para?: string;
    proposito?: string;
    estrategia_metodologica?: string;  // alias legacy
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    redactado?: string;
    codigo_biblioteca_adaptacion?: number | null;
}

// ─── Recursos ─────────────────────────────────────────────────────────────────

export interface RecursoLibraryItem {
    id_recursos: number;
    tipo?: string;
    recursos?: string;
    redactado?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    ejemplo?: string;
    apto_para?: string;
}

export interface RecursoItem extends BasePlanningDetail {
    id_recursos?: number | string;
    planificacion_semanal_id?: string;
    tipo?: string;
    recursos?: string;
    redactado?: string;
    proposito?: string;
    apto_para?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    ejemplo?: string;
    codigo_biblioteca_recursos?: number | null;
}


// ─── Tipo de Fuente (catálogo) ────────────────────────────────────────────────

/**
 * Fila de la tabla catálogo `tipo_fuente`.
 * Relación 1:N → biblioteca_mi_fuente.tipo (FK a id_tipo_fuente).
 */
export interface TipoFuente {
    id_tipo_fuente: number;
    tipo_fuente: string;
    descripcion?: string | null;
    created_at?: string;
    updated_at?: string;
}

// ─── Fuentes (Mi Fuente) ──────────────────────────────────────────────────────

/** Fila de biblioteca_mi_fuente (biblioteca personal permanente del docente) */
export interface MiFuenteLibraryItem {
    id_mi_fuente: number;
    /** FK → perfiles.id — propietario de la fuente */
    perfil_id?: string;
    /** FK → tipo_fuente.id_tipo_fuente (guardado como TEXT del valor seleccionado) */
    tipo?: string | null;
    /** Objeto join opcional cuando se hace SELECT con tipo_fuente(*) */
    tipo_fuente_obj?: TipoFuente | null;
    autor?: string;
    anio?: string;
    titulo_fuente?: string;
    url?: string;
    detalle?: string;
    created_at?: string;
    updated_at?: string;
}

/** Fila de mi_fuente (instancia vinculada a planificacion_semanal) */
export interface MiFuenteItem extends BasePlanningDetail {
    id_fuente?: number | string;
    planificacion_semanal_id?: string;
    /** FK → tipo_fuente.id_tipo_fuente (guardado como TEXT del valor seleccionado) */
    tipo?: string | null;
    autor?: string;
    anio?: string;
    titulo_fuente?: string;
    url?: string;
    detalle?: string;
    codigo_biblioteca_mi_fuente?: number | null;
}

// ─── Evaluación: SER ──────────────────────────────────────────────────────────

export interface SerLibraryItem {
    id_ser: number;
    categoria: string;
    subcategoria: string;
    nombre_ser: string;
    descripcion?: string;
    redactado?: string;
    instrumento_sugerido?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    dificultad?: string;
}

export interface SerItem extends SerLibraryItem {
    pdc_area_trabajo_id: string;
    codigo_biblioteca_ser?: number;
    created_at?: string;
    updated_at?: string;
}

// ─── Evaluación: SABER ────────────────────────────────────────────────────────

export interface SaberLibraryItem {
    id_saber: number;
    nivel: string;
    subnivel: string;
    verbo_saber: string;
    redactado?: string;
    evidencia?: string;
    instrumento_sugerido?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    dificultad?: string;
}

export interface SaberItem extends SaberLibraryItem {
    pdc_area_trabajo_id: string;
    codigo_biblioteca_saber?: number;
    created_at?: string;
    updated_at?: string;
}

// ─── Evaluación: HACER ────────────────────────────────────────────────────────

export interface HacerLibraryItem {
    id_hacer: number;
    nivel: string;
    subnivel: string;
    verbo: string;
    redactado?: string;
    producto?: string;
    instrumento_sugerido?: string;
    ejemplo_inicial?: string;
    ejemplo_primaria?: string;
    ejemplo_secundaria?: string;
    ejemplo_multigrado?: string;
    dificultad?: string;
}

export interface HacerItem extends HacerLibraryItem {
    pdc_area_trabajo_id: string;
    codigo_biblioteca_hacer?: number;
    created_at?: string;
    updated_at?: string;
}

// ─── Evaluación: ADAPTACIÓN ESPECIAL ──────────────────────────────────────────

export interface AdaptacionEvaluacionLibraryItem {
    id_adaptacion_evaluacion: number;
    condicion: string;
    descripcion?: string;
    implicaciones_generales?: string;
    nombre_adaptacion: string;
    ejemplo?: string;
    redactado?: string;
}

export interface AdaptacionEvaluacionItem extends AdaptacionEvaluacionLibraryItem {
    pdc_area_trabajo_id: string;
    codigo_biblioteca_evaluacion_adaptaciones_especiales?: number;
    created_at?: string;
    updated_at?: string;
}
// --- Report & Export Types (Unified) ---

export interface HierarchyRoot extends UserContent {
    children: (UserContent & { global_sub_index: number })[];
    global_index: number;
    present_as_root: boolean;
}

export interface FullReportArea {
    id: string; // ID de pdc_area_trabajo
    nombre: string;
    grado_nombre: string;
    objetivos_aprendizaje: string;
    criterios_evaluacion: string;
    criterios_evaluacion_ia?: string;
    adaptaciones_no_significativas: string;
    adaptaciones_no_significativas_ia?: string;
    adaptaciones_especiales_ia?: string;
    criterios_evaluacion_adaptaciones: string;
    criterios_evaluacion_adaptaciones_ia?: string;
    periodo_semanal: number;
    semanas: PlanificacionSemanal[];
}

export interface FullReportData {
    distritos: string;
    unidades: string;
    niveles: string;
    grados: string;
    areas: string;
    docente: string;
    director: string;
    objetivo_holistico_nivel: string;
    areas_trabajo: FullReportArea[];
    bibliografia_global?: string;
}

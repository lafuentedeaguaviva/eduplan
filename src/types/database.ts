/**
 * DATABASE SCHEMA DOCUMENTATION (TypeScript)
 * 
 * Este archivo sirve como la fuente de verdad para la estructura de la base de datos en Supabase.
 * Proporciona tipos estrictos y documentación (TSDoc) para cada tabla y campo.
 */

// =============================================================================
// 1. USUARIOS Y SEGURIDAD
// =============================================================================

/**
 * Tabla: perfiles
 * Información extendida de los usuarios autenticados.
 */
export interface DbPerfil {
    /** UUID del usuario (Referencia a auth.users.id) */
    id: string;
    /** Título profesional (ej: Profesor, Director) */
    titulo: string | null;
    /** Nombres del usuario */
    nombres: string;
    /** Apellidos del usuario */
    apellidos: string;
    /** Género del usuario */
    genero: string | null;
    /** Correo electrónico institucional o personal */
    email: string;
    /** Número de celular de contacto */
    celular: string | null;
    /** URL de la imagen de perfil */
    foto_url: string | null;
    /** Créditos antiguos (deprecado en favor de monedas) */
    creditos: number;
    /** Monedas del nuevo sistema (EduCoins) */
    monedas_disponibles?: number;
    /** Último plan comprado por el usuario */
    ultimo_plan_comprado?: string;
    /** Indica si el usuario completó su configuración inicial */
    estado_completitud: boolean;
    /** Fecha de creación del perfil */
    created_at: string;
    /** Fecha de última actualización */
    updated_at: string;
}

/**
 * Tabla: roles
 * Catálogo de roles disponibles en el sistema.
 */
export interface DbRol {
    /** Nombre único del rol (Administrador, Director, Profesor) */
    nombre: string;
    /** Descripción de las capacidades del rol */
    descripcion: string | null;
}

// =============================================================================
// 1.5. SISTEMA DE MONETIZACIÓN (EDUCOINS)
// =============================================================================

export interface DbConfigMonetizacion {
    id: string;
    costo_pdc_secundaria: number;
    costo_pdc_primaria: number;
    costo_examen: number;
    costo_autocompletar: number;
    bono_registro_inicial: number;
    updated_at: string;
}

export interface DbPaqueteMonedas {
    id: string;
    nombre: string;
    descripcion: string | null;
    precio_bob: number;
    monedas_otorgadas: number;
    activo: boolean;
    orden: number;
}

export interface DbPagoQr {
    id: string;
    perfil_id: string;
    paquete_id: string | null;
    monto_bob: number;
    comprobante_url: string;
    estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
    revisado_por: string | null;
    fecha_solicitud: string;
    fecha_revision: string | null;
}

export interface DbHistorialTransacciones {
    id: string;
    perfil_id: string;
    tipo: 'Recarga' | 'Gasto IA' | 'Bono Demo' | 'Reembolso';
    descripcion: string;
    monto_monedas: number;
    saldo_resultante: number;
    fecha: string;
}

// =============================================================================
// 2. ESTRUCTURA ACADÉMICA Y GEOGRÁFICA
// =============================================================================

/**
 * Tabla: unidades_educativas
 * Registro oficial de instituciones educativas (Escuelas/Colegios).
 */
export interface DbUnidadEducativa {
    /** Código SIE de la unidad educativa (PK) */
    id: number;
    /** Nombre oficial de la institución */
    nombre: string;
    /** Área geográfica (Urbana/Rural) */
    area: string | null;
    /** Nivel de atención (Inicial, Primaria, Secundaria) */
    nivel: string | null;
    /** Dirección física */
    direccion: string | null;
    /** ID del distrito educativo al que pertenece */
    distrito_id: number;
    /** UUID del profesor que actúa como director (opcional) */
    director_id: string | null;
}

/**
 * Tabla: areas_conocimiento
 * Especialidades curriculares vinculadas a un grado.
 */
export interface DbAreaConocimiento {
    /** ID único de la especialidad */
    id: number;
    /** Nombre de la materia (Matemáticas, Lenguaje, etc.) */
    nombre: string;
    /** ID del grado al que pertenece */
    grado_id: number;
}

// =============================================================================
// 3. PLANIFICACIÓN Y ÁREAS DE TRABAJO
// =============================================================================

/**
 * Tabla: areas_trabajo
 * Representa el "aula virtual" del profesor para una materia y grado específicos.
 */
export interface DbAreaTrabajo {
    /** ID único del área de trabajo */
    id: string;
    /** ID del profesor propietario */
    profesor_id: string;
    /** ID de la unidad educativa vinculada */
    unidad_educativa_id: number;
    /** ID del área de conocimiento vinculada */
    area_conocimiento_id: number;
    /** ID del turno (Mañana, Tarde, Noche) */
    turno_id: string;
    /** Nombre descriptivo generado automáticamente */
    nombre: string | null;
    /** ID del registro de diseño (Step 8) vinculado */
    pdc_area_trabajo_id: string | null;
    /** ID del perfil del director asignado */
    director_id: string | null;
}

/**
 * Tabla: contenidos_usuario
 * Temas y subtemas personalizados por el profesor.
 */
export interface DbContenidoUsuario {
    /** ID único del contenido (64-bit) */
    id: number;
    /** ID del área de trabajo vinculada */
    area_trabajo_id: string;
    /** ID del contenido base original (64-bit) */
    origen_base_id: number | null;
    /** ID del contenido padre (64-bit) */
    padre_id: number | null;
    titulo: string;
    orden: number;
    created_at: string;
    updated_at: string;
}

/**
 * Tabla: pdcs_area_trabajo
 * Persistencia de configuración de diseño del PDC (Wizard).
 */
export interface DbPdcsAreaTrabajo {
    id: string;
    /** ID del PDC maestro al que pertenece este diseño */
    pdc_id: string;
    /** ID del área de trabajo vinculada */
    area_trabajo_id?: string | null;
    periodo_semanal: number | null;
    criterios_evaluacion_ia: string | null;
    adaptaciones_no_significativas: string | null;
    adaptaciones_no_significativas_ia: string | null;
    criterios_evaluacion_adaptaciones_ia: string | null;
    criterios_evaluacion?: any[] | null;
    criterio_adptacion_evaluacion?: any[] | null;
    objetivo_estrategico?: string | null;
    objetivo_estrategico_ia?: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Tabla: pdcs
 * Plan de Desarrollo Curricular (Maestro).
 */
export interface DbPdc {
    id: string;
    docente_id: string;
    nombre_pdc: string | null;
    gestion: number;
    trimestre: number | null;
    mes: number | null;
    estado: 'Pendiente' | 'Verificado' | 'Rechazado';
    director_id: string | null;
    observaciones_director: string | null;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    producto_final: string | null;
    escritura_tipo_ia: string | null;
    correccion_profundidad_ia: string | null;
    evaluacion_tipo_ia: string | null;
    ia_habilitado: number | null;
    created_at: string;
    updated_at: string;
}

/**
 * Tabla: planificacion_semanal
 * Cabecera de la planificación detallada por semana.
 */
export interface DbPlanificacionSemanal {
    /** ID único de la planificación de la semana */
    id: string;
    /** ID del área de trabajo propietaria */
    area_trabajo_id: string;
    /** ID del diseño de PDC al que pertenece esta planificación */
    pdc_area_trabajo_id?: string | null;
    /** Gestión escolar (ej: 2024) */
    gestion: number;
    /** Trimestre del año (1, 2 o 3) */
    trimestre: number;
    /** Mes relativo dentro del trimestre (1, 2 o 3) */
    mes: number;
    /** Semana del mes (1 a 5) */
    semana: number;
    /** Notas u observaciones del docente para esta semana */
    observaciones_generales: string | null;
    /** Contenido optimizado por IA para los momentos de la semana */
    momentos_ia: string | null;
    /** Recursos y fuentes optimizados */
    recursos_fuentes_ia: string | null;
    /** Adaptaciones básicas optimizadas */
    adaptaciones_basicas_ia: string | null;
    /** Adaptaciones especiales optimizadas */
    adaptaciones_especiales_ia: string | null;
    /** Gestión de discapacidad optimizada (obsoleto, usar adaptaciones_especiales_ia) */
    discapacidad_ia: string | null;
    /** Adaptaciones curriculares optimizadas (obsoleto, usar adaptaciones_basicas_ia) */
    adaptaciones_curriculares_ia: string | null;
    /** Lista ordenada de momentos metodológicos (JSON) */
    momentos: any[] | null;
    /** Recursos seleccionados (JSON) */
    recursos: any[] | null;
    /** Fuentes seleccionadas (JSON) */
    fuentes: any[] | null;
    /** Snapshot de adaptaciones básicas (JSON) */
    adaptaciones_basicas: any[] | null;
    /** Snapshot de adaptaciones especiales (JSON) */
    adaptacion_especial: any[] | null;
}

// =============================================================================
// 4. COMPONENTES DEL PDC (PASO 8) - INSTANCIAS
// =============================================================================

/**
 * Tabla: teoria
 * Estrategias teóricas planificadas para una semana.
 */
export interface DbTeoria {
    /** ID único de la instancia de teoría */
    id_teoria: number;
    /** ID de la planificación semanal vinculada */
    planificacion_semanal_id: string;
    /** ID de referencia del catálogo maestro (opcional) */
    codigo_biblioteca_teoria: number | null;
    /** Título de la estrategia teórica */
    nombre_estrategia_teorica: string;
    /** Contenido desarrollado de la estrategia */
    redactado: string | null;
    tipo?: string | null;
    proposito?: string | null;
    descripcion_concreta?: string | null;
}

/**
 * Tabla: practica
 * Actividades prácticas diseñadas para la semana.
 */
export interface DbPractica {
    id_practica: number;
    planificacion_semanal_id: string;
    codigo_biblioteca_practica: number | null;
    nombre_practica: string;
    /** Preguntas activadoras de la práctica */
    preguntas: string | null;
    /** Redacción paso a paso de la actividad */
    redactado: string | null;
    tipo?: string | null;
    proposito?: string | null;
    descripcion_concreta?: string | null;
}

/**
 * Tabla: produccion
 * Productos o evidencias de aprendizaje esperados.
 */
export interface DbProduccion {
    id_produccion: number;
    planificacion_semanal_id: string;
    codigo_biblioteca_produccion: number | null;
    /** Nombre del producto a obtener */
    nombre_produccion: string;
    /** Instrumento de evaluación sugerido */
    instrumento: string | null;
    /** Consigna detallada para el estudiante */
    redactado: string | null;
    nivel?: string | null;
    subnivel?: string | null;
    tipo?: string | null;
    proposito?: string | null;
    descripcion_concreta?: string | null;
}

/**
 * Tabla: valoracion
 * Momentos de reflexión socio-afectiva y evaluación de valores.
 */
export interface DbValoracion {
    id_valoracion: number;
    planificacion_semanal_id: string;
    codigo_biblioteca_valoracion: number | null;
    /** Categoría de valoración (Saber, Ser, Decidir, etc.) */
    categoria: string;
    subcategoria: string | null;
    proposito: string | null;
    /** Preguntas de reflexión */
    preguntas: string | null;
    /** Texto final de la valoración */
    redactado: string | null;
    /** Instrumento sugerido */
    instrumento: string | null;
}

/**
 * Tabla: recursos
 * Materiales y medios utilizados en la semana.
 */
export interface DbRecurso {
    id_recursos: number;
    planificacion_semanal_id: string;
    codigo_biblioteca_recursos: number | null;
    /** Tipo de recurso (Analógico, Digital, etc.) */
    tipo: string | null;
    /** Nombre o descripción breve del recurso */
    recursos: string | null;
    /** Uso pedagógico detallado */
    redactado: string | null;
    ejemplo_inicial: string | null;
    ejemplo_primaria: string | null;
    ejemplo_secundaria: string | null;
    ejemplo_multigrado: string | null;
}

/**
 * Tabla: mi_fuente
 * Bibliografía citada por el docente (específica de la semana).
 */
export interface DbMiFuente {
    id_mi_fuente: number;
    planificacion_semanal_id: string;
    codigo_biblioteca_mi_fuente: number | null;
    /** Tipo de fuente (Libro, Web, etc.) */
    tipo: string | null;
    /** Autor(es) de la obra */
    autor: string | null;
    /** Año de publicación */
    anio: string | null;
    /** Título del recurso bibliográfico */
    titulo_fuente: string | null;
    /** Enlace web (si aplica) */
    url: string | null;
    /** Páginas o capítulos específicos */
    detalle: string | null;
}

/**
 * Tabla: adaptaciones_basicas
 * Ajustes curriculares para atender necesidades especiales.
 */
export interface DbAdaptacionBasica {
    id_adaptacion_basica: number;
    planificacion_semanal_id: string;
    codigo_biblioteca_adaptacion: number | null;
    /** Tipo de adaptación (Grado 1, 2 o 3) */
    tipo: string | null;
    /** Situación o condición del estudiante */
    situacion: string | null;
    /** Breve descripción o contexto de la situación */
    descripcion_situacion: string | null;
    /** Nombre de la adaptación aplicada */
    nombre_adaptacion: string | null;
    /** Descripción técnica del ajuste */
    redactado: string | null;
    ejemplo_inicial: string | null;
    ejemplo_primaria: string | null;
    ejemplo_secundaria: string | null;
    ejemplo_multigrado: string | null;
}

// =============================================================================
// 6. EVALUACIÓN Y OBJETIVOS (PASO 8)
// =============================================================================

/**
 * Tabla: ser
 * Criterios de evaluación para la dimensión del Ser.
 */
export interface DbSer {
    id_ser: number;
    pdc_area_trabajo_id: string;
    categoria: string | null;
    subcategoria: string | null;
    nombre_ser: string;
    descripcion: string | null;
    redactado: string | null;
    instrumento_sugerido: string | null;
    ejemplo_inicial: string | null;
    ejemplo_primaria: string | null;
    ejemplo_secundaria: string | null;
    ejemplo_multigrado: string | null;
    dificultad: string | null;
    codigo_biblioteca_ser: number | null;
    created_at?: string;
}

/**
 * Tabla: saber
 * Criterios de evaluación para la dimensión del Saber.
 */
export interface DbSaber {
    id_saber: number;
    pdc_area_trabajo_id: string;
    nivel: string | null;
    subnivel: string | null;
    verbo_saber: string;
    redactado: string | null;
    evidencia: string | null;
    instrumento_sugerido: string | null;
    ejemplo_inicial: string | null;
    ejemplo_primaria: string | null;
    ejemplo_secundaria: string | null;
    ejemplo_multigrado: string | null;
    dificultad: string | null;
    codigo_biblioteca_saber: number | null;
    created_at?: string;
}

/**
 * Tabla: hacer
 * Criterios de evaluación para la dimensión del Hacer.
 */
export interface DbHacer {
    id_hacer: number;
    pdc_area_trabajo_id: string;
    nivel: string | null;
    subnivel: string | null;
    verbo: string;
    redactado: string | null;
    producto: string | null;
    instrumento_sugerido: string | null;
    ejemplo_inicial: string | null;
    ejemplo_primaria: string | null;
    ejemplo_secundaria: string | null;
    ejemplo_multigrado: string | null;
    dificultad: string | null;
    codigo_biblioteca_hacer: number | null;
    created_at?: string;
}

/**
 * Tabla: evaluacion_adaptaciones_especiales
 * Adaptaciones específicas para la evaluación.
 */
export interface DbEvaluacionAdaptacionEspecial {
    id_adaptacion_evaluacion: number;
    pdc_area_trabajo_id: string;
    condicion: string;
    descripcion: string | null;
    implicaciones_generales: string | null;
    nombre_adaptacion: string;
    ejemplo: string | null;
    redactado: string | null;
    codigo_biblioteca_evaluacion_adaptaciones_especiales: number | null;
    created_at?: string;
}

/**
 * Tabla: objetivo_estrategico
 * Objetivos de aprendizaje vinculados a contenidos específicos.
 */
export interface DbObjetivoEstrategico {
    id: string;
    pdc_area_trabajo_id: string;
    descripcion: string;
    descripcion_ia?: string;
    created_at?: string;
}

/**
 * Relación n:n entre objetivos y contenidos del usuario
 */
export interface DbObjetivoEstrategicoContenido {
    objetivo_estrategico_id: string;
    contenido_usuario_id: number;
}

// =============================================================================
// 7. BIBLIOTECAS (CATÁLOGOS MAESTROS)
// =============================================================================

/**
 * Tabla: biblioteca_teoria
 */
export interface DbBibliotecaTeoria {
    id_teoria: number;
    nombre_estrategia_teorica: string;
    proposito: string | null;
    redactado: string | null;
    ejemplo_inicial: string | null;
    ejemplo_primaria: string | null;
    ejemplo_secundaria: string | null;
    ejemplo_multigrado: string | null;
    created_at?: string;
}

/**
 * Estructura común para bibliotecas de evaluación
 */
export interface DbBibliotecaEvaluacionBase {
    categoria?: string | null;
    subcategoria?: string | null;
    nivel?: string | null;
    subnivel?: string | null;
    nombre_ser?: string;
    verbo_saber?: string;
    verbo?: string;
    descripcion?: string | null;
    redactado?: string | null;
    instrumento_sugerido?: string | null;
    ejemplo_inicial?: string | null;
    ejemplo_primaria?: string | null;
    ejemplo_secundaria?: string | null;
    ejemplo_multigrado?: string | null;
    dificultad?: string | null;
    created_at?: string;
}

/**
 * Tabla: catalogo_verbos
 */
export interface DbCatalogoVerbo {
    id: number;
    verbo: string;
    tipo_verbo_id: number | null;
    detalle_tipo: string | null;
    descripcion: string | null;
    niveles_educativos: string[];
    dominio: string | null;
    nivel_profundidad: string | null;
    ejemplo_indicativo: string | null;
    created_at?: string;
}

/**
 * Tabla: catalogo_complementos
 */
export interface DbCatalogoComplemento {
    id: number;
    complemento: string;
    tipo_complemento_id: number | null;
    detalle_tipo: string | null;
    descripcion: string | null;
    categoria: string | null;
    subcategoria: string | null;
    niveles_sugeridos: string[];
    ejemplo_uso: string | null;
    created_at?: string;
}

/**
 * Master Database Interface for Supabase
 */
export interface Database {
    public: {
        Tables: {
            perfiles: { Row: DbPerfil; };
            roles: { Row: DbRol; };
            unidades_educativas: { Row: DbUnidadEducativa; };
            areas_conocimiento: { Row: DbAreaConocimiento; };
            areas_trabajo: { Row: DbAreaTrabajo; };
            contenidos_usuario: { Row: DbContenidoUsuario; };
            pdcs_area_trabajo: { Row: DbPdcsAreaTrabajo; };
            planificacion_semanal: { Row: DbPlanificacionSemanal; };
            teoria: { Row: DbTeoria; };
            practica: { Row: DbPractica; };
            produccion: { Row: DbProduccion; };
            valoracion: { Row: DbValoracion; };
            recursos: { Row: DbRecurso; };
            mi_fuente: { Row: DbMiFuente; };
            adaptaciones_basicas: { Row: DbAdaptacionBasica; };
            ser: { Row: DbSer; };
            saber: { Row: DbSaber; };
            hacer: { Row: DbHacer; };
            evaluacion_adaptaciones_especiales: { Row: DbEvaluacionAdaptacionEspecial; };
            objetivo_estrategico: { Row: DbObjetivoEstrategico; };
            objetivo_estrategico_contenido: { Row: DbObjetivoEstrategicoContenido; };
            biblioteca_teoria: { Row: DbBibliotecaTeoria; };
            biblioteca_ser: { Row: DbBibliotecaEvaluacionBase; };
            biblioteca_saber: { Row: DbBibliotecaEvaluacionBase; };
            biblioteca_hacer: { Row: DbBibliotecaEvaluacionBase; };
            biblioteca_evaluacion_adaptaciones_especiales: { Row: DbBibliotecaEvaluacionBase; };
            catalogo_verbos: { Row: DbCatalogoVerbo; };
            catalogo_complementos: { Row: DbCatalogoComplemento; };
            config_monetizacion: { Row: DbConfigMonetizacion; };
            paquetes_monedas: { Row: DbPaqueteMonedas; };
            pagos_qr: { Row: DbPagoQr; };
            historial_transacciones: { Row: DbHistorialTransacciones; };
        };
    };
}

-- =========================================================================
-- SCRIPT "TODO EN UNO" - CONFIGURACIÓN INICIAL COMPLETA EDUPLAN PRO
-- Fecha: 2026-04-18
-- Descripción: Este script crea toda la estructura de la base de datos
--              basada en BasedeDatos.md, incluyendo TODAS las tablas de
--              bibliotecas, instancias,triggers, RLS y datos iniciales.
-- =========================================================================

-- ============================================
-- 0. CONFIGURACIÓN INICIAL Y EXTENSIONES
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Función para actualizar el timestamp updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. USUARIOS Y SEGURIDAD
-- ============================================

CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT,
    nombres TEXT NOT NULL DEFAULT '',
    apellidos TEXT NOT NULL DEFAULT '',
    email CITEXT NOT NULL,
    celular TEXT,
    foto_url TEXT,
    creditos INTEGER NOT NULL DEFAULT 0,
    solicitudes_ia_hoy INTEGER NOT NULL DEFAULT 0,
    ultima_solicitud_ia TIMESTAMPTZ,
    gemini_api_key TEXT,
    estado_completitud BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
    nombre TEXT PRIMARY KEY,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.perfil_roles (
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    rol_nombre TEXT REFERENCES public.roles(nombre) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (perfil_id, rol_nombre)
);

-- Inserción de Roles Básicos
INSERT INTO public.roles (nombre, descripcion) VALUES
('Profesor', 'Usuario con capacidad de crear y gestionar sus propios PDCs.'),
('Director', 'Usuario con capacidad de revisar y verificar PDCs de su unidad educativa.'),
('Administrador', 'Control total del sistema y catálogos.')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 2. SISTEMA DE SUSCRIPCIONES
-- ============================================

CREATE TABLE IF NOT EXISTS public.planes_suscripcion (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    precio NUMERIC NOT NULL DEFAULT 0,
    limite_creditos INTEGER NOT NULL DEFAULT 0,
    caracteristicas JSONB DEFAULT '[]',
    color_scheme TEXT DEFAULT 'slate',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.costos_servicios (
    id SERIAL PRIMARY KEY,
    accion TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    costo_creditos INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.costos_servicios (accion, descripcion, costo_creditos) VALUES
('exportar_pdf', 'Exportar el PDC a formato PDF Premium', 1),
('exportar_word', 'Exportar el PDC a formato Microsoft Word', 2),
('ia_asistente_avanzado', 'Consulta profunda al asistente pedagógico', 1),
('informe_director', 'Generación de informe estadístico para el director', 5)
ON CONFLICT (accion) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.suscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    perfil_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES public.planes_suscripcion(id) ON DELETE RESTRICT,
    estado TEXT NOT NULL CHECK (estado IN ('activo', 'cancelado', 'expirado', 'trial')),
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    id_proveedor_pago TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transacciones_credito (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL,
    motivo TEXT NOT NULL,
    referencia_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.planes_suscripcion (nombre, descripcion, precio, limite_creditos, caracteristicas, color_scheme) VALUES
('Gratuito', 'Acceso básico. Usa tu propia Gemini Key.', 0, 5, '["3 PDCs por mes", "Exportación PDF estándar", "Soporte comunitario"]', 'slate'),
('Premium', 'Uso intensivo y herramientas avanzadas.', 49, 100, '["PDCs ilimitados", "Exportación Word/PDF Premium", "Herramientas de IA avanzado", "Soporte prioritario"]', 'indigo'),
('Institucional', 'Control total para unidades educativas.', 450, 2000, '["Cuentas para todos los docentes", "Panel administrativo para el Director", "Reportes estadísticos ilimitados", "Soporte 24/7"]', 'emerald')
ON CONFLICT (nombre) DO NOTHING;

-- Helper para verificar roles
CREATE OR REPLACE FUNCTION public.usuario_tiene_rol(p_rol TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfil_roles
        WHERE perfil_id = auth.uid() AND rol_nombre = p_rol
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. GEOGRAFÍA Y ADMINISTRATIVO
-- ============================================

CREATE TABLE IF NOT EXISTS public.departamentos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.distritos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    departamento_id INTEGER NOT NULL REFERENCES public.departamentos(id) ON DELETE CASCADE,
    provincia TEXT,
    municipio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (nombre, departamento_id)
);

CREATE TABLE IF NOT EXISTS public.unidades_educativas (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    area TEXT,
    nivel TEXT,
    latitud NUMERIC,
    longitud NUMERIC,
    direccion TEXT,
    telefono BIGINT,
    distrito_id INTEGER NOT NULL REFERENCES public.distritos(id) ON DELETE RESTRICT,
    director_id UUID UNIQUE REFERENCES public.perfiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.departamentos (id, nombre) VALUES 
(1, 'Chuquisaca'), (2, 'La Paz'), (3, 'Cochabamba'), (4, 'Oruro'), (5, 'Potosí'), (6, 'Tarija'), (7, 'Santa Cruz'), (8, 'Beni'), (9, 'Pando')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. ESTRUCTURA ACADÉMICA
-- ============================================

CREATE TABLE IF NOT EXISTS public.niveles (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    nombre TEXT NOT NULL UNIQUE,
    objetivo_holistico TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grados (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    nombre TEXT NOT NULL,
    nivel_id INTEGER NOT NULL REFERENCES public.niveles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (nombre, nivel_id)
);

CREATE TABLE IF NOT EXISTS public.areas_conocimiento (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    nombre TEXT NOT NULL,
    grado_id INTEGER NOT NULL REFERENCES public.grados(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (nombre, grado_id)
);

CREATE TABLE IF NOT EXISTS public.contenidos_base (
    id BIGSERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    padre_id BIGINT REFERENCES public.contenidos_base(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL DEFAULT 1,
    trimestre TEXT,
    area_conocimiento_id INTEGER NOT NULL REFERENCES public.areas_conocimiento(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.paralelos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.turnos (nombre) VALUES ('Mañana'), ('Tarde'), ('Noche'), ('Continuo') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO public.paralelos (nombre) VALUES ('A'), ('B'), ('C'), ('D'), ('E'), ('F') ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 5. ÁREAS DE TRABAJO
-- ============================================

CREATE TABLE IF NOT EXISTS public.areas_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profesor_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    unidad_educativa_id INTEGER NOT NULL REFERENCES public.unidades_educativas(id) ON DELETE CASCADE,
    area_conocimiento_id INTEGER NOT NULL REFERENCES public.areas_conocimiento(id) ON DELETE RESTRICT,
    turno_id UUID NOT NULL REFERENCES public.turnos(id) ON DELETE RESTRICT,
    nombre TEXT,
    pdc_area_trabajo_id UUID REFERENCES public.pdcs_area_trabajo(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (profesor_id, unidad_educativa_id, area_conocimiento_id, turno_id)
);

CREATE TABLE IF NOT EXISTS public.area_trabajo_paralelo (
    area_trabajo_id UUID REFERENCES public.areas_trabajo(id) ON DELETE CASCADE,
    paralelo_id UUID REFERENCES public.paralelos(id) ON DELETE CASCADE,
    horario JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (area_trabajo_id, paralelo_id)
);

CREATE TABLE IF NOT EXISTS public.contenidos_usuario (
    id BIGSERIAL PRIMARY KEY,
    area_trabajo_id UUID NOT NULL REFERENCES public.areas_trabajo(id) ON DELETE CASCADE,
    origen_base_id BIGINT REFERENCES public.contenidos_base(id) ON DELETE SET NULL,
    padre_id BIGINT REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helper para obtener el ID máximo de contenidos de usuario (Necesario para copyAll)
-- Se define como BIGINT para soportar el nuevo esquema de 64-bit.
CREATE OR REPLACE FUNCTION public.get_max_user_content_id()
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE((SELECT MAX(id) FROM public.contenidos_usuario), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. PDC MAESTRO Y DISEÑO CURRICULAR
-- ============================================

CREATE TABLE IF NOT EXISTS public.pdcs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    docente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    nombre_pdc TEXT,
    gestion INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    trimestre INTEGER CHECK (trimestre BETWEEN 1 AND 3),
    mes INTEGER,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    director_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    observaciones_director TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pdcs_area_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdc_id UUID REFERENCES public.pdcs(id) ON DELETE CASCADE,
    periodo_semanal INTEGER DEFAULT 0,
    periodos TEXT DEFAULT '',
    criterios_evaluacion_ia TEXT DEFAULT '',
    adaptaciones_no_significativas_ia TEXT DEFAULT '',
    criterios_evaluacion_adaptaciones_ia TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. PLANIFICACIÓN SEMANAL
-- ============================================

CREATE TABLE IF NOT EXISTS public.planificacion_semanal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_trabajo_id UUID NOT NULL REFERENCES public.areas_trabajo(id) ON DELETE CASCADE,
    gestion INTEGER NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 3),
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 5),
    fecha_inicio_trimestre DATE NOT NULL,
    fecha_fin_trimestre DATE NOT NULL,
    observaciones_generales TEXT,
    momentos_ia TEXT DEFAULT '',
    recursos_y_fuentes_ia TEXT DEFAULT '',
    discapacidad_ia TEXT DEFAULT '',
    adaptaciones_curriculares_ia TEXT DEFAULT '',
    criterio_ser TEXT DEFAULT '',
    criterio_saber TEXT DEFAULT '',
    criterio_hacer TEXT DEFAULT '',
    criterio_decidir TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (area_trabajo_id, gestion, trimestre, mes, semana)
);

CREATE TABLE IF NOT EXISTS public.semana_contenido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    planificacion_semanal_id UUID NOT NULL REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    contenido_usuario_id BIGINT NOT NULL REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL DEFAULT 1,
    observaciones TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. BIBLIOTECAS (CATÁLOGOS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.biblioteca_teoria (
    id_teoria SERIAL PRIMARY KEY,
    nombre_estrategia_teorica TEXT NOT NULL,
    proposito TEXT,
    redactado TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_practica (
    id_practica SERIAL PRIMARY KEY,
    nombre_practica TEXT NOT NULL,
    proposito TEXT,
    descripcion_concreta TEXT,
    preguntas TEXT,
    redactado TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_produccion (
    id_produccion SERIAL PRIMARY KEY,
    nombre_produccion TEXT NOT NULL,
    instrumento TEXT,
    redactado TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_valoracion (
    id_valoracion SERIAL PRIMARY KEY,
    categoria TEXT NOT NULL,
    preguntas TEXT,
    redactado TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_recursos (
    id_recursos SERIAL PRIMARY KEY,
    tipo TEXT,
    recursos TEXT,
    redactado TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_adaptaciones_basicas (
    id_adaptacion_basica SERIAL PRIMARY KEY,
    tipo TEXT,
    situacion TEXT,
    nombre_adaptacion TEXT,
    redactado TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tipo_fuente (
    id_tipo_fuente SERIAL PRIMARY KEY,
    tipo_fuente TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_mi_fuente (
    id_mi_fuente SERIAL PRIMARY KEY,
    perfil_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    tipo TEXT,
    autor TEXT,
    anio TEXT,
    titulo_fuente TEXT,
    url TEXT,
    detalle TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. TABLAS DE INSTANCIA (PASO 8)
-- ============================================

CREATE TABLE IF NOT EXISTS public.teoria (
    id_teoria SERIAL PRIMARY KEY,
    planificacion_semanal_id UUID REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    codigo_biblioteca_teoria INTEGER REFERENCES public.biblioteca_teoria(id_teoria) ON DELETE SET NULL,
    nombre_estrategia_teorica TEXT NOT NULL,
    redactado TEXT,
    redactado_ia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.practica (
    id_practica SERIAL PRIMARY KEY,
    planificacion_semanal_id UUID REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    codigo_biblioteca_practica INTEGER REFERENCES public.biblioteca_practica(id_practica) ON DELETE SET NULL,
    nombre_practica TEXT NOT NULL,
    preguntas TEXT,
    redactado TEXT,
    redactado_ia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.produccion (
    id_produccion SERIAL PRIMARY KEY,
    planificacion_semanal_id UUID REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    codigo_biblioteca_produccion INTEGER REFERENCES public.biblioteca_produccion(id_produccion) ON DELETE SET NULL,
    nombre_produccion TEXT NOT NULL,
    instrumento TEXT,
    redactado TEXT,
    redactado_ia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.valoracion (
    id_valoracion SERIAL PRIMARY KEY,
    planificacion_semanal_id UUID REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    id_biblioteca_valoracion INTEGER REFERENCES public.biblioteca_valoracion(id_valoracion) ON DELETE SET NULL,
    categoria TEXT NOT NULL,
    preguntas TEXT,
    redactado TEXT,
    redactado_ia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recursos (
    id_recursos SERIAL PRIMARY KEY,
    planificacion_semanal_id UUID REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    codigo_biblioteca_recursos INTEGER REFERENCES public.biblioteca_recursos(id_recursos) ON DELETE SET NULL,
    tipo TEXT,
    recursos TEXT,
    redactado TEXT,
    redactado_ia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mi_fuente (
    id_mi_fuente SERIAL PRIMARY KEY,
    planificacion_semanal_id UUID REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    codigo_biblioteca_mi_fuente INTEGER REFERENCES public.biblioteca_mi_fuente(id_mi_fuente) ON DELETE SET NULL,
    tipo TEXT,
    autor TEXT,
    anio TEXT,
    titulo_fuente TEXT,
    url TEXT,
    detalle TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.adaptaciones_basicas (
    id_adaptacion_basica SERIAL PRIMARY KEY,
    planificacion_semanal_id UUID REFERENCES public.planificacion_semanal(id) ON DELETE CASCADE,
    id_biblioteca_adaptacion INTEGER REFERENCES public.biblioteca_adaptaciones_basicas(id_adaptacion_basica) ON DELETE SET NULL,
    tipo TEXT,
    situacion TEXT,
    nombre_adaptacion TEXT,
    redactado TEXT,
    redactado_ia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. EVALUACIÓN Y OBJETIVOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.biblioteca_ser (
    id_ser SERIAL PRIMARY KEY,
    categoria TEXT,
    subcategoria TEXT,
    nombre_ser TEXT NOT NULL,
    descripcion TEXT,
    redactado TEXT,
    instrumento_sugerido TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    dificultad TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_saber (
    id_saber SERIAL PRIMARY KEY,
    nivel TEXT,
    subnivel TEXT,
    verbo_saber TEXT NOT NULL,
    redactado TEXT,
    evidencia TEXT,
    instrumento_sugerido TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    dificultad TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_hacer (
    id_hacer SERIAL PRIMARY KEY,
    nivel TEXT,
    subnivel TEXT,
    verbo TEXT NOT NULL,
    redactado TEXT,
    producto TEXT,
    instrumento_sugerido TEXT,
    ejemplo_inicial TEXT,
    ejemplo_primaria TEXT,
    ejemplo_secundaria TEXT,
    ejemplo_multigrado TEXT,
    dificultad TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.biblioteca_evaluacion_adaptaciones_especiales (
    id_adaptacion_evaluacion SERIAL PRIMARY KEY,
    condicion TEXT NOT NULL,
    descripcion TEXT,
    implicaciones_generales TEXT,
    nombre_adaptacion TEXT NOT NULL,
    ejemplo TEXT,
    redactado TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ser (
    id_ser SERIAL PRIMARY KEY,
    pdc_area_trabajo_id UUID NOT NULL REFERENCES public.pdcs_area_trabajo(id) ON DELETE CASCADE,
    categoria TEXT,
    subcategoria TEXT,
    nombre_ser TEXT NOT NULL,
    descripcion TEXT,
    redactado TEXT,
    redactado_ia TEXT,
    instrumento_sugerido TEXT,
    dificultad TEXT,
    codigo_biblioteca_ser INTEGER REFERENCES public.biblioteca_ser(id_ser) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saber (
    id_saber SERIAL PRIMARY KEY,
    pdc_area_trabajo_id UUID NOT NULL REFERENCES public.pdcs_area_trabajo(id) ON DELETE CASCADE,
    nivel TEXT,
    subnivel TEXT,
    verbo_saber TEXT NOT NULL,
    redactado TEXT,
    redactado_ia TEXT,
    evidencia TEXT,
    instrumento_sugerido TEXT,
    dificultad TEXT,
    codigo_biblioteca_saber INTEGER REFERENCES public.biblioteca_saber(id_saber) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hacer (
    id_hacer SERIAL PRIMARY KEY,
    pdc_area_trabajo_id UUID NOT NULL REFERENCES public.pdcs_area_trabajo(id) ON DELETE CASCADE,
    nivel TEXT,
    subnivel TEXT,
    verbo TEXT NOT NULL,
    redactado TEXT,
    redactado_ia TEXT,
    producto TEXT,
    instrumento_sugerido TEXT,
    dificultad TEXT,
    codigo_biblioteca_hacer INTEGER REFERENCES public.biblioteca_hacer(id_hacer) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evaluacion_adaptaciones_especiales (
    id_adaptacion_evaluacion SERIAL PRIMARY KEY,
    pdc_area_trabajo_id UUID NOT NULL REFERENCES public.pdcs_area_trabajo(id) ON DELETE CASCADE,
    condicion TEXT NOT NULL,
    descripcion TEXT,
    implicaciones_generales TEXT,
    nombre_adaptacion TEXT NOT NULL,
    ejemplo TEXT,
    redactado TEXT,
    codigo_biblioteca_evaluacion_adaptaciones_especiales INTEGER REFERENCES public.biblioteca_evaluacion_adaptaciones_especiales(id_adaptacion_evaluacion) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. OBJETIVOS ESTRATÉGICOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.objetivo_estrategico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdc_area_trabajo_id UUID NOT NULL REFERENCES public.pdcs_area_trabajo(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.objetivo_estrategico_contenido (
    objetivo_estrategico_id UUID NOT NULL REFERENCES public.objetivo_estrategico(id) ON DELETE CASCADE,
    contenido_usuario_id BIGINT NOT NULL REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE,
    PRIMARY KEY (objetivo_estrategico_id, contenido_usuario_id)
);


-- ============================================
-- 12. APOYO Y CATÁLOGOS IA
-- ============================================

CREATE TABLE IF NOT EXISTS public.catalogo_verbos (
    id SERIAL PRIMARY KEY,
    verbo TEXT NOT NULL,
    tipo_verbo_id INTEGER,
    detalle_tipo TEXT,
    descripcion TEXT,
    niveles_educativos TEXT[] DEFAULT '{}',
    dominio TEXT,
    nivel_profundidad TEXT,
    ejemplo_indicativo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.catalogo_complementos (
    id SERIAL PRIMARY KEY,
    complemento TEXT NOT NULL,
    tipo_complemento_id INTEGER,
    detalle_tipo TEXT,
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. OPTIMIZACIÓN DE RENDIMIENTO (ÍNDICES)
-- Impacto: JOINs y ON DELETE CASCADE optimizados
-- ============================================

-- Geografía y Unidades
CREATE INDEX IF NOT EXISTS idx_distritos_departamento ON public.distritos(departamento_id);
CREATE INDEX IF NOT EXISTS idx_unidades_distrito ON public.unidades_educativas(distrito_id);
CREATE INDEX IF NOT EXISTS idx_unidades_director ON public.unidades_educativas(director_id);

-- Estructura Académica
CREATE INDEX IF NOT EXISTS idx_grados_nivel ON public.grados(nivel_id);
CREATE INDEX IF NOT EXISTS idx_areas_grado ON public.areas_conocimiento(grado_id);
CREATE INDEX IF NOT EXISTS idx_contenidos_base_area ON public.contenidos_base(area_conocimiento_id);
CREATE INDEX IF NOT EXISTS idx_contenidos_base_padre ON public.contenidos_base(padre_id);

-- Áreas de Trabajo y Contenidos
CREATE INDEX IF NOT EXISTS idx_areas_trabajo_profesor ON public.areas_trabajo(profesor_id);
CREATE INDEX IF NOT EXISTS idx_areas_trabajo_ue ON public.areas_trabajo(unidad_educativa_id);
CREATE INDEX IF NOT EXISTS idx_areas_trabajo_ac ON public.areas_trabajo(area_conocimiento_id);
CREATE INDEX IF NOT EXISTS idx_areas_trabajo_turno ON public.areas_trabajo(turno_id);
CREATE INDEX IF NOT EXISTS idx_areas_trabajo_pdc_at ON public.areas_trabajo(pdc_area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_at_paralelo_at ON public.area_trabajo_paralelo(area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_at_paralelo_pa ON public.area_trabajo_paralelo(paralelo_id);
CREATE INDEX IF NOT EXISTS idx_contenidos_usuario_at ON public.contenidos_usuario(area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_contenidos_usuario_padre ON public.contenidos_usuario(padre_id);

-- PDCs y Diseño
CREATE INDEX IF NOT EXISTS idx_pdcs_docente ON public.pdcs(docente_id);
CREATE INDEX IF NOT EXISTS idx_pdcs_director ON public.pdcs(director_id);
CREATE INDEX IF NOT EXISTS idx_pdcs_at_pdc ON public.pdcs_area_trabajo(pdc_id);

-- Planificación Semanal
CREATE INDEX IF NOT EXISTS idx_plan_semanal_at ON public.planificacion_semanal(area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_semana_contenido_plan ON public.semana_contenido(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_semana_contenido_cu ON public.semana_contenido(contenido_usuario_id);

-- Instancias Metodológicas (Step 8)
CREATE INDEX IF NOT EXISTS idx_teoria_plan ON public.teoria(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_practica_plan ON public.practica(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_produccion_plan ON public.produccion(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_valoracion_plan ON public.valoracion(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_recursos_plan ON public.recursos(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_mi_fuente_plan ON public.mi_fuente(planificacion_semanal_id);
CREATE INDEX IF NOT EXISTS idx_adaptaciones_plan ON public.adaptaciones_basicas(planificacion_semanal_id);

-- Evaluación y Objetivos
CREATE INDEX IF NOT EXISTS idx_ser_at ON public.ser(pdc_area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_saber_at ON public.saber(pdc_area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_hacer_at ON public.hacer(pdc_area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_adaptaciones_especiales_at ON public.evaluacion_adaptaciones_especiales(pdc_area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_objetivo_estrategico_at ON public.objetivo_estrategico(pdc_area_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_oe_contenido_oe ON public.objetivo_estrategico_contenido(objetivo_estrategico_id);
CREATE INDEX IF NOT EXISTS idx_oe_contenido_cu ON public.objetivo_estrategico_contenido(contenido_usuario_id);

-- Suscripciones y Créditos
CREATE INDEX IF NOT EXISTS idx_suscripciones_perfil ON public.suscripciones(perfil_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario ON public.transacciones_credito(usuario_id);

-- ============================================
-- 14. SEGURIDAD (RLS)
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;

-- Permisos básicos
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Permisos para usuarios autenticados (Wizard e Inserción)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Políticas de lectura pública para catálogos
DO $$
DECLARE
    tablas TEXT[] := ARRAY['departamentos', 'distritos', 'unidades_educativas', 'niveles', 'grados', 'areas_conocimiento', 'turnos', 'paralelos', 'tipo_fuente', 'catalogo_verbos', 'catalogo_complementos', 'planes_suscripcion'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tablas LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Lectura publica" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Lectura publica" ON public.%I FOR SELECT USING (true);', t);
        EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated;', t);
    END LOOP;
END $$;

-- Política de lectura pública para contenidos base
CREATE POLICY "Lectura publica contenidos base" ON public.contenidos_base FOR SELECT USING (true);
GRANT SELECT ON public.contenidos_base TO authenticated;

-- Políticas de bibliotecas (Iniciadas como abiertas para gestión autenticada)
DO $$
DECLARE
    tablas TEXT[] := ARRAY['biblioteca_teoria', 'biblioteca_practica', 'biblioteca_produccion', 'biblioteca_valoracion', 'biblioteca_recursos', 'biblioteca_adaptaciones_basicas', 'biblioteca_mi_fuente', 'biblioteca_ser', 'biblioteca_saber', 'biblioteca_hacer', 'biblioteca_evaluacion_adaptaciones_especiales'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tablas LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Gestion bibliotecas autenticados" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Gestion bibliotecas autenticados" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated;', t);
    END LOOP;
END $$;

-- Políticas de gestión privacidad estricta para instancias (Docente)
DO $$
DECLARE
    tablas TEXT[] := ARRAY['teoria', 'practica', 'produccion', 'valoracion', 'recursos', 'mi_fuente', 'adaptaciones_basicas', 'ser', 'saber', 'hacer', 'evaluacion_adaptaciones_especiales', 'objetivo_estrategico', 'objetivo_estrategico_contenido', 'semana_contenido', 'area_trabajo_paralelo'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tablas LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Gestion instancias propia" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Gestion instancias propia" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true);', t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated;', t);
    END LOOP;
END $$;

-- Perfiles y Seguridad
CREATE POLICY "Ver propio perfil" ON public.perfiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Actualizar propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id);
GRANT ALL ON public.perfiles TO authenticated;

-- RLS para costos_servicios (Lectura pública, edición Admin)
CREATE POLICY "Lectura publica costos" ON public.costos_servicios FOR SELECT USING (true);
CREATE POLICY "Gestion admin costos" ON public.costos_servicios FOR ALL 
    TO authenticated USING (public.usuario_tiene_rol('Administrador')) 
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- RLS para planes_suscripcion (Extender para que Admin pueda editar)
CREATE POLICY "Gestion admin planes" ON public.planes_suscripcion FOR ALL 
    TO authenticated USING (public.usuario_tiene_rol('Administrador')) 
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- RLS para gemini_api_key (Solo dueño puede ver/editar su perfi - ya cubierto por Ver propio perfil/Actualizar propio perfil pero forzamos la privacidad)
-- Nota: En producción, gemini_api_key debería estar en una tabla cifrada o usar Supabase Vault.

-- Permisos adicionales para catálogos de roles
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.perfil_roles TO authenticated;

CREATE POLICY "Gestionar propios PDCs" ON public.pdcs FOR ALL TO authenticated USING (docente_id = auth.uid()) WITH CHECK (docente_id = auth.uid());
GRANT ALL ON public.pdcs TO authenticated;

CREATE POLICY "Gestionar diseños vinculados" ON public.pdcs_area_trabajo FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.pdcs WHERE id = pdc_id AND docente_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.pdcs WHERE id = pdc_id AND docente_id = auth.uid()));
GRANT ALL ON public.pdcs_area_trabajo TO authenticated;

CREATE POLICY "Gestionar contenidos propios" ON public.contenidos_usuario FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.areas_trabajo WHERE id = area_trabajo_id AND profesor_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.areas_trabajo WHERE id = area_trabajo_id AND profesor_id = auth.uid()));
GRANT ALL ON public.contenidos_usuario TO authenticated;

-- RLS para Áreas de Trabajo (Propia gestión)
CREATE POLICY "Gestionar propias areas" ON public.areas_trabajo FOR ALL 
    TO authenticated USING (profesor_id = auth.uid()) 
    WITH CHECK (profesor_id = auth.uid());
GRANT ALL ON public.areas_trabajo TO authenticated;

CREATE POLICY "Usuarios ven su propia suscripción" ON public.suscripciones FOR SELECT USING (auth.uid() = perfil_id);
GRANT SELECT ON public.suscripciones TO authenticated;

CREATE POLICY "Usuarios ven sus transacciones" ON public.transacciones_credito FOR SELECT USING (auth.uid() = usuario_id);
GRANT SELECT ON public.transacciones_credito TO authenticated;

-- ============================================
-- 15. TRIGGERS Y AUTOMATIZACIÓN
-- ============================================

-- Automático updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public') LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS tr_update_updated_at ON public.%I', t);
        EXECUTE format('CREATE TRIGGER tr_update_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
    END LOOP;
END $$;

-- Limpieza huérfanos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_pdc_designs()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.pdc_area_trabajo_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM public.areas_trabajo WHERE pdc_area_trabajo_id = OLD.pdc_area_trabajo_id AND id != OLD.id) THEN
            DELETE FROM public.pdcs_area_trabajo WHERE id = OLD.pdc_area_trabajo_id;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_orphaned_designs ON public.areas_trabajo;
CREATE TRIGGER trigger_cleanup_orphaned_designs AFTER DELETE ON public.areas_trabajo FOR EACH ROW EXECUTE FUNCTION public.cleanup_orphaned_pdc_designs();

-- Generación automática de nombres
CREATE OR REPLACE FUNCTION public.generate_area_trabajo_nombre()
RETURNS TRIGGER AS $$
BEGIN
    NEW.nombre := (SELECT u.nombre FROM public.unidades_educativas u WHERE u.id = NEW.unidad_educativa_id) || ' - ' ||
                   (SELECT ac.nombre FROM public.areas_conocimiento ac WHERE ac.id = NEW.area_conocimiento_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_area_trabajo_nombre ON public.areas_trabajo;
CREATE TRIGGER trigger_generate_area_trabajo_nombre BEFORE INSERT ON public.areas_trabajo FOR EACH ROW EXECUTE FUNCTION public.generate_area_trabajo_nombre();

-- Reinicio diario de cuota IA
CREATE OR REPLACE FUNCTION public.reset_ai_quota_on_new_day()
RETURNS TRIGGER AS $$
BEGIN
    -- Si la última solicitud fue en un día diferente al actual (zona horaria del servidor), resetear
    IF (OLD.ultima_solicitud_ia::DATE < NOW()::DATE) OR OLD.ultima_solicitud_ia IS NULL THEN
        NEW.solicitudes_ia_hoy := 0;
    END IF;
    -- Actualizar siempre el timestamp de la última solicitud
    NEW.ultima_solicitud_ia := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_reset_ai_quota ON public.perfiles;
CREATE TRIGGER tr_reset_ai_quota BEFORE UPDATE OF solicitudes_ia_hoy ON public.perfiles FOR EACH ROW EXECUTE FUNCTION public.reset_ai_quota_on_new_day();

-- Nota: trigger_generate_area_trabajo_nombre ya fue definido arriba.

-- Manejo nuevo usuario (AUTH)
-- Optimizado para Google OAuth: Extrae nombre y foto automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    full_name TEXT;
    avatar_url TEXT;
BEGIN
    full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    avatar_url := NEW.raw_user_meta_data->>'avatar_url';

    INSERT INTO public.perfiles (id, email, nombres, apellidos, foto_url, titulo)
    VALUES (
        NEW.id, 
        NEW.email, 
        full_name, -- Se guarda el nombre completo en el campo nombres inicialmente
        '',        -- Apellidos se deja vacío para edición posterior
        avatar_url, 
        'Profesor'
    )
    ON CONFLICT (id) DO NOTHING;
   
    INSERT INTO public.perfil_roles (perfil_id, rol_nombre) VALUES (NEW.id, 'Profesor') ON CONFLICT DO NOTHING;
   
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Nota: Asegúrate de que el trigger on_auth_user_created se cree contra auth.users en Supabase
-- CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Migración: Gestión Institucional
-- Fecha: 2026-09-03
-- ============================================

-- 1. Crear nuevo rol: Secretario
INSERT INTO public.roles (nombre, descripcion) 
VALUES ('Secretario', 'Encargado de subir normativas e inventarios de la unidad educativa.')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Tabla para vincular personal (Secretario/Docente) a una unidad educativa
CREATE TABLE IF NOT EXISTS public.unidad_educativa_personal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_educativa_id INTEGER NOT NULL REFERENCES public.unidades_educativas(id) ON DELETE CASCADE,
    perfil_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    rol_institucional TEXT NOT NULL CHECK (rol_institucional IN ('Secretario', 'Docente')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (unidad_educativa_id, perfil_id)
);

-- 3. Tabla para Curriculum Vitae de Profesores
CREATE TABLE IF NOT EXISTS public.profesor_cv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID NOT NULL UNIQUE REFERENCES public.perfiles(id) ON DELETE CASCADE,
    formacion_academica JSONB DEFAULT '[]'::jsonb,
    experiencia_laboral JSONB DEFAULT '[]'::jsonb,
    habilidades JSONB DEFAULT '[]'::jsonb,
    sobre_mi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla para Recursos Institucionales (Normativas y Bienes)
CREATE TABLE IF NOT EXISTS public.recursos_institucionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_educativa_id INTEGER NOT NULL REFERENCES public.unidades_educativas(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('normativa', 'bien')),
    titulo_nombre TEXT NOT NULL,
    descripcion TEXT,
    archivo_url TEXT, -- URL donde se guarda (Ej. Drive, Dropbox, o storage futuro)
    cantidad INTEGER, -- Aplica para tipo 'bien'
    estado_bien TEXT, -- Aplica para tipo 'bien' (ej. Bueno, Regular, Malo)
    creado_por UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Políticas de Seguridad (RLS)
-- ============================================

ALTER TABLE public.unidad_educativa_personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profesor_cv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_institucionales ENABLE ROW LEVEL SECURITY;

-- Unidad Educativa Personal RLS
CREATE POLICY "Lectura pública de personal institucional" 
    ON public.unidad_educativa_personal FOR SELECT 
    USING (true);

CREATE POLICY "Gestión de personal por directores y admin" 
    ON public.unidad_educativa_personal FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.unidades_educativas ue 
            WHERE ue.id = unidad_educativa_id AND ue.director_id = auth.uid()
        ) OR public.usuario_tiene_rol('Administrador')
    );

-- Profesor CV RLS
CREATE POLICY "Lectura pública de CVs" 
    ON public.profesor_cv FOR SELECT 
    USING (true);

CREATE POLICY "Docente edita su propio CV" 
    ON public.profesor_cv FOR ALL 
    USING (perfil_id = auth.uid())
    WITH CHECK (perfil_id = auth.uid());

-- Recursos Institucionales RLS
CREATE POLICY "Lectura de recursos para personal de la escuela" 
    ON public.recursos_institucionales FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.unidad_educativa_personal uep 
            WHERE uep.unidad_educativa_id = recursos_institucionales.unidad_educativa_id 
            AND uep.perfil_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM public.unidades_educativas ue 
            WHERE ue.id = unidad_educativa_id AND ue.director_id = auth.uid()
        )
    );

CREATE POLICY "Secretario inserta y edita recursos" 
    ON public.recursos_institucionales FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.unidad_educativa_personal uep 
            WHERE uep.unidad_educativa_id = recursos_institucionales.unidad_educativa_id 
            AND uep.perfil_id = auth.uid()
            AND uep.rol_institucional = 'Secretario'
        )
    );

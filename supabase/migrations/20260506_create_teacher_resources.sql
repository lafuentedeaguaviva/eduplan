-- Migration: 20260506_create_teacher_resources.sql
-- Description: Estructura para gestionar categorías y recursos descargables para docentes.

-- 1. Categorías de Recursos
CREATE TABLE IF NOT EXISTS public.recurso_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    icono TEXT DEFAULT 'folder',
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Recursos para Docentes
CREATE TABLE IF NOT EXISTS public.recursos_docente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES public.recurso_categorias(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    url_archivo TEXT NOT NULL,
    tipo_archivo TEXT, -- PDF, DOCX, XLSX, etc.
    peso_archivo TEXT, -- Ej: 2.5 MB
    premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.recurso_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_docente ENABLE ROW LEVEL SECURITY;

-- 4. Policies
-- Todos los usuarios autenticados pueden ver categorías y recursos
CREATE POLICY "Anyone can view resource categories" ON public.recurso_categorias
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can view teacher resources" ON public.recursos_docente
    FOR SELECT TO authenticated USING (true);

-- Solo Administradores pueden gestionar (ALL)
CREATE POLICY "Admins can manage resource categories" ON public.recurso_categorias
    FOR ALL TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

CREATE POLICY "Admins can manage teacher resources" ON public.recursos_docente
    FOR ALL TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 5. Data Inicial
INSERT INTO public.recurso_categorias (nombre, descripcion, icono, orden) VALUES
('Plantillas', 'Formatos oficiales de PDC, registros y reportes.', 'description', 1),
('Estrategias', 'Guías metodológicas y técnicas de aula.', 'psychology', 2),
('Normativas', 'Leyes, reglamentos y circulares vigentes.', 'gavel', 3),
('Herramientas', 'Calculadoras, sistemas Excel y utilitarios.', 'handyman', 4)
ON CONFLICT DO NOTHING;

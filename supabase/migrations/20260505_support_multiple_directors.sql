-- Migration: 20260505_support_multiple_directors.sql
-- Description: Create a table to manage multiple directors per unit (Primaria, Secundaria, etc.)

-- 1. Create the new table
CREATE TABLE IF NOT EXISTS public.gestion_directores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unidad_id INTEGER NOT NULL REFERENCES public.unidades_educativas(id) ON DELETE CASCADE,
    perfil_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    nivel TEXT NOT NULL DEFAULT 'General', -- 'Primaria', 'Secundaria', 'Inicial', 'General'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(unidad_id, nivel),
    UNIQUE(perfil_id)
);

-- 2. Migrate existing directors
INSERT INTO public.gestion_directores (unidad_id, perfil_id, nivel)
SELECT id, director_id, 'General'
FROM public.unidades_educativas
WHERE director_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3. Enable RLS
ALTER TABLE public.gestion_directores ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Anyone can view directors" ON public.gestion_directores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage directors" ON public.gestion_directores
    FOR ALL TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 5. Add a view for easier fetching (Optional but helpful)
CREATE OR REPLACE VIEW public.vista_directores AS
SELECT 
    gd.id,
    gd.unidad_id,
    ue.nombre as unidad_nombre,
    gd.perfil_id,
    p.nombres,
    p.apellidos,
    gd.nivel
FROM public.gestion_directores gd
JOIN public.unidades_educativas ue ON gd.unidad_id = ue.id
JOIN public.perfiles p ON gd.perfil_id = p.id;

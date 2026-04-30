-- Migration: Create planificacion_semanal_general
-- Description: Master table for global trimester weeks.

CREATE TABLE IF NOT EXISTS public.planificacion_semanal_general (
    id INTEGER PRIMARY KEY, -- Manual ID format: YYTMW (e.g. 26111 for 2026, Trim 1, Month 1, Week 1)
    gestion INTEGER NOT NULL,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 5), -- Relative month within the trimester (1, 2, 3...)
    semana INTEGER NOT NULL CHECK (semana BETWEEN 1 AND 5), -- Week number within that month
    fecha_inicio_trimestre DATE NOT NULL, -- Date mark for the start of the trimester reference
    fecha_fin_trimestre DATE NOT NULL,    -- Date mark for the end of the trimester reference
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & Permissions
ALTER TABLE public.planificacion_semanal_general ENABLE ROW LEVEL SECURITY;

-- Lectura pública para todos los usuarios autenticados (necesario para heredar fechas)
DROP POLICY IF EXISTS "Lectura publica cronograma" ON public.planificacion_semanal_general;
CREATE POLICY "Lectura publica cronograma" ON public.planificacion_semanal_general 
    FOR SELECT TO authenticated USING (true);

-- Gestión completa solo para Administradores
DROP POLICY IF EXISTS "Gestion admin cronograma" ON public.planificacion_semanal_general;
CREATE POLICY "Gestion admin cronograma" ON public.planificacion_semanal_general 
    FOR ALL TO authenticated 
    USING (public.usuario_tiene_rol('Administrador')) 
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

GRANT ALL ON public.planificacion_semanal_general TO authenticated;

-- Automatic updated_at
DROP TRIGGER IF EXISTS tr_update_updated_at_general ON public.planificacion_semanal_general;
CREATE TRIGGER tr_update_updated_at_general 
    BEFORE UPDATE ON public.planificacion_semanal_general 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

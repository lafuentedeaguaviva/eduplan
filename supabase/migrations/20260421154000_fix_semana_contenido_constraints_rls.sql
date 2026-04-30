-- Migration: Fix Constraints and RLS for semana_contenido
-- Description: Adds UNIQUE constraint for upsert functionality and establishes strict RLS policies.

BEGIN;

-- 1. Asegurar que RLS esté activo
ALTER TABLE public.semana_contenido ENABLE ROW LEVEL SECURITY;

-- 2. Añadir restricción de UNICIDAD para permitir UPSERT (onConflict)
-- Primero eliminamos si ya existe por alguna razón accidental
ALTER TABLE public.semana_contenido DROP CONSTRAINT IF EXISTS semana_contenido_plan_content_unique;
ALTER TABLE public.semana_contenido ADD CONSTRAINT semana_contenido_plan_content_unique UNIQUE (planificacion_semanal_id, contenido_usuario_id);

-- 3. Limpiar políticas antiguas (de bucles previos o genéricas)
DROP POLICY IF EXISTS "Gestion instancias propia" ON public.semana_contenido;
DROP POLICY IF EXISTS "Gestionar contenido propio de semanas" ON public.semana_contenido;

-- 4. Crear política de seguridad específica y robusta
-- Permite todas las operaciones si el usuario es el profesor del área de trabajo asociada a la semana de planificación
CREATE POLICY "Gestionar contenido propio de semanas" ON public.semana_contenido
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.planificacion_semanal ps
            JOIN public.areas_trabajo at ON at.id = ps.area_trabajo_id
            WHERE ps.id = planificacion_semanal_id
            AND at.profesor_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.planificacion_semanal ps
            JOIN public.areas_trabajo at ON at.id = ps.area_trabajo_id
            WHERE ps.id = planificacion_semanal_id
            AND at.profesor_id = auth.uid()
        )
    );

-- 5. Garantizar permisos de acceso al rol authenticated
GRANT ALL ON public.semana_contenido TO authenticated;

COMMIT;

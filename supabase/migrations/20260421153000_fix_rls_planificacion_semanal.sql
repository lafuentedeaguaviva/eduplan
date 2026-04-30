-- Migration: Fix RLS for planificacion_semanal
-- Description: Allow teachers to manage their own schedules based on area_trabajo_id ownership.

-- 1. Enable RLS (Should be already enabled, but we force it for safety)
ALTER TABLE public.planificacion_semanal ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy if any (to avoid duplicates)
DROP POLICY IF EXISTS "Gestionar propia planificacion semanal" ON public.planificacion_semanal;

-- 3. Create the management policy
-- Permite todas las operaciones (SELECT, INSERT, UPDATE, DELETE) si el profesor_id del área corresponde al usuario autenticado.
CREATE POLICY "Gestionar propia planificacion semanal" ON public.planificacion_semanal
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.areas_trabajo 
            WHERE id = area_trabajo_id 
            AND profesor_id = auth.uid()
        )
    ) 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.areas_trabajo 
            WHERE id = area_trabajo_id 
            AND profesor_id = auth.uid()
        )
    );

-- 4. Ensure permissions
GRANT ALL ON public.planificacion_semanal TO authenticated;

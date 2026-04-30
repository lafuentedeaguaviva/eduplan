-- Migración: Añadir campos de snapshot de evaluación a pdcs_area_trabajo
-- Objetivo: Almacenar los criterios consolidados de Ser, Saber, Hacer y Adaptaciones.

ALTER TABLE public.pdcs_area_trabajo 
ADD COLUMN IF NOT EXISTS criterios_evaluacion JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS criterio_adptacion_evaluacion JSONB DEFAULT '[]'::jsonb;

-- Comentarios para documentación
COMMENT ON COLUMN public.pdcs_area_trabajo.criterios_evaluacion IS 'Snapshot consolidado de los criterios de evaluación (Ser, Saber, Hacer)';
COMMENT ON COLUMN public.pdcs_area_trabajo.criterio_adptacion_evaluacion IS 'Snapshot consolidado de los criterios de evaluación para adaptaciones especiales';

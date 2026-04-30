-- Migration: Update planificacion_semanal to support consolidated moments and JSONB storage
-- Description: Adds momentos, recursos, and fuentes JSONB columns; removes legacy criteria columns.

ALTER TABLE public.planificacion_semanal 
    ADD COLUMN IF NOT EXISTS momentos JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS recursos JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS fuentes JSONB DEFAULT '[]'::jsonb;

-- Remove legacy criteria columns as requested
ALTER TABLE public.planificacion_semanal 
    DROP COLUMN IF EXISTS criterio_saber,
    DROP COLUMN IF EXISTS criterio_hacer,
    DROP COLUMN IF EXISTS criterio_decidir;

-- Add comments for documentation
COMMENT ON COLUMN public.planificacion_semanal.momentos IS 'Lista ordenada de actividades de Práctica, Teoría, Producción y Valoración.';
COMMENT ON COLUMN public.planificacion_semanal.recursos IS 'Lista de recursos seleccionados para la semana.';
COMMENT ON COLUMN public.planificacion_semanal.fuentes IS 'Lista de fuentes bibliográficas seleccionadas para la semana.';

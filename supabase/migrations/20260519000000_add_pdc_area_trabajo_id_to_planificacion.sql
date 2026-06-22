-- Migration: Add pdc_area_trabajo_id to planificacion_semanal
-- This links a weekly plan directly to its parent PDC area workspace (Step 8 design)

ALTER TABLE public.planificacion_semanal 
ADD COLUMN IF NOT EXISTS pdc_area_trabajo_id UUID REFERENCES public.pdcs_area_trabajo(id) ON DELETE CASCADE;

COMMENT ON COLUMN public.planificacion_semanal.pdc_area_trabajo_id IS 'Referencia al diseño del PDC (pdcs_area_trabajo) que enmarca esta planificación semanal.';

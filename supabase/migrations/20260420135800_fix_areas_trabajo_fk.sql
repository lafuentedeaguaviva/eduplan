-- =========================================================================
-- MIGRACIÓN: Corregir relación faltante entre areas_trabajo y pdcs_area_trabajo
-- Fecha: 2026-04-20
-- =========================================================================

BEGIN;

-- 1. LIMPIAR HUERFANOS (SEGURIDAD)
-- -------------------------------------------------------------------------
-- Si existen IDs en areas_trabajo que no existen en pdcs_area_trabajo, los ponemos a NULL
-- para evitar que la creación de la FK falle.
UPDATE public.areas_trabajo
SET pdc_area_trabajo_id = NULL
WHERE pdc_area_trabajo_id IS NOT NULL 
  AND pdc_area_trabajo_id NOT IN (SELECT id FROM public.pdcs_area_trabajo);

-- 2. AGREGAR LLAVE FORÁNEA
-- -------------------------------------------------------------------------
ALTER TABLE public.areas_trabajo
DROP CONSTRAINT IF EXISTS areas_trabajo_pdc_area_trabajo_id_fkey;

ALTER TABLE public.areas_trabajo
ADD CONSTRAINT areas_trabajo_pdc_area_trabajo_id_fkey
FOREIGN KEY (pdc_area_trabajo_id)
REFERENCES public.pdcs_area_trabajo(id)
ON DELETE SET NULL;

-- 3. CREAR ÍNDICE DE RENDIMIENTO
-- -------------------------------------------------------------------------
-- Optimiza los JOINs que realiza Supabase/PostgREST
CREATE INDEX IF NOT EXISTS idx_areas_trabajo_pdc_at ON public.areas_trabajo(pdc_area_trabajo_id);

COMMIT;

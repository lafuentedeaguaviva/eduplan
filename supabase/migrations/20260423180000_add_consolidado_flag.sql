-- Migration: Add consolidado flag to planificacion_semanal
-- Description: Tracking if the pedagogical moments order has been explicitly verified by the user.

ALTER TABLE public.planificacion_semanal 
ADD COLUMN IF NOT EXISTS consolidado INTEGER DEFAULT 0;

COMMENT ON COLUMN public.planificacion_semanal.consolidado IS '0: No consolidado, 1: Consolidado y verificado por el usuario';

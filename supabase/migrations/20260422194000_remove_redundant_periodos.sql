-- Migración: Eliminar campo redundante 'periodos' de pdcs_area_trabajo
-- Prime Directive: Atomic, explicable and non-destructive.

ALTER TABLE public.pdcs_area_trabajo DROP COLUMN IF EXISTS periodos;

-- Asegurar que periodo_semanal tenga un valor por defecto
ALTER TABLE public.pdcs_area_trabajo ALTER COLUMN periodo_semanal SET DEFAULT 0;

-- Migration: Update planificacion_semanal to ON DELETE SET NULL
-- Propósito: Evitar que al borrar un PDC (y sus pdcs_area_trabajo asociados) se elimine el trabajo
-- de planificación de las semanas y momentos. En su lugar, el enlace se vuelve NULL, dejando
-- las semanas huérfanas pero intactas en su respectiva área de trabajo (clase).

BEGIN;

ALTER TABLE public.planificacion_semanal 
DROP CONSTRAINT IF EXISTS planificacion_semanal_pdc_area_trabajo_id_fkey;

ALTER TABLE public.planificacion_semanal
ADD CONSTRAINT planificacion_semanal_pdc_area_trabajo_id_fkey
FOREIGN KEY (pdc_area_trabajo_id)
REFERENCES public.pdcs_area_trabajo(id)
ON DELETE SET NULL;

COMMIT;

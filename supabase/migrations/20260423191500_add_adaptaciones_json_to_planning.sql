-- Migración: Añadir campo adaptaciones_basicas a planificacion_semanal
-- Objetivo: Guardar un snapshot JSON de las adaptaciones para facilitar reportes y consistencia.

ALTER TABLE planificacion_semanal 
ADD COLUMN IF NOT EXISTS adaptaciones_basicas JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN planificacion_semanal.adaptaciones_basicas IS 'Snapshot de las adaptaciones curriculares para la semana';

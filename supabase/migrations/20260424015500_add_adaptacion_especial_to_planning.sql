-- Migración: Añadir campo adaptacion_especial a planificacion_semanal
-- Objetivo: Separar las adaptaciones de tipo "especial" de las básicas.

ALTER TABLE planificacion_semanal 
ADD COLUMN IF NOT EXISTS adaptacion_especial JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN planificacion_semanal.adaptacion_especial IS 'Snapshot de las adaptaciones curriculares de tipo especial para la semana';

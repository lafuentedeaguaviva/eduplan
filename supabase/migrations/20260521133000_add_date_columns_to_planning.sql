-- Migration: Add extra date columns to planning tables
-- Propósito: Permitir la definición opcional de fechas de inicio y fin
-- a nivel de mes y de semana.

BEGIN;

ALTER TABLE public.planificacion_semanal_general
ADD COLUMN IF NOT EXISTS fecha_inicio_mes DATE,
ADD COLUMN IF NOT EXISTS fecha_fin_mes DATE,
ADD COLUMN IF NOT EXISTS fecha_inicio_semana DATE,
ADD COLUMN IF NOT EXISTS fecha_fin_semana DATE;

ALTER TABLE public.planificacion_semanal
ADD COLUMN IF NOT EXISTS fecha_inicio_mes DATE,
ADD COLUMN IF NOT EXISTS fecha_fin_mes DATE,
ADD COLUMN IF NOT EXISTS fecha_inicio_semana DATE,
ADD COLUMN IF NOT EXISTS fecha_fin_semana DATE;

COMMIT;

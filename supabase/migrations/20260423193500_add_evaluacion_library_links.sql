-- Migración: Añadir vínculos de biblioteca a las tablas de evaluación (Dimensiones del Ser, Saber, Hacer y Adaptaciones)
-- Objetivo: Permitir que los criterios de evaluación guardados mantengan una referencia a su origen en la biblioteca.

BEGIN;

-- 1. Dimensión SER
ALTER TABLE public.ser 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_ser BIGINT;

-- 2. Dimensión SABER
ALTER TABLE public.saber 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_saber BIGINT;

-- 3. Dimensión HACER
ALTER TABLE public.hacer 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_hacer BIGINT;

-- 4. Adaptaciones de Evaluación Especiales
ALTER TABLE public.evaluacion_adaptaciones_especiales 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_evaluacion_adaptaciones_especiales BIGINT;

COMMIT;

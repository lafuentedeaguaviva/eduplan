-- =========================================================================
-- MIGRATION: Change 'trimestre' to TEXT in 'contenidos_base'
-- Fecha: 2026-04-20
-- =========================================================================

-- 1. Eliminar la restricción (constraint) CHECK que limitaba los valores a enteros (1, 2, 3)
ALTER TABLE public.contenidos_base 
DROP CONSTRAINT IF EXISTS contenidos_base_trimestre_check;

-- 2. Modificar el tipo de la columna a TEXT, autoconvirtiendo los enteros existentes a texto
ALTER TABLE public.contenidos_base 
ALTER COLUMN trimestre TYPE TEXT USING trimestre::TEXT;

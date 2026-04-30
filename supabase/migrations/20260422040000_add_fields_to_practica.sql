-- =========================================================================
-- MIGRACIÓN: Enriquecimiento de Práctica (Library & Instance)
-- Fecha: 2026-04-22
-- Descripción: Añade campos 'tipo' y 'apto_para' a biblioteca_practica y practica.
-- =========================================================================

-- 1. Añadir columnas a biblioteca_practica
ALTER TABLE public.biblioteca_practica 
ADD COLUMN IF NOT EXISTS tipo TEXT,
ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 2. Añadir columnas a la tabla de instancias practica
ALTER TABLE public.practica 
ADD COLUMN IF NOT EXISTS tipo TEXT,
ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 3. Comentar columnas para claridad pedagógica
COMMENT ON COLUMN public.biblioteca_practica.tipo IS 'Categoría de la práctica (ej: Lúdica, Experimental, Observación)';
COMMENT ON COLUMN public.biblioteca_practica.apto_para IS 'Niveles o contextos recomendados para esta práctica';

-- =========================================================================
-- MIGRACIÓN: Enriquecer metadatos de catalogo_complementos
-- Fecha: 2026-04-21
-- Descripción: Añade campos para categorización y ejemplos de uso a los complementos.
-- =========================================================================

ALTER TABLE public.catalogo_complementos
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS subcategoria TEXT,
ADD COLUMN IF NOT EXISTS niveles_sugeridos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ejemplo_uso TEXT;

-- Comentario descriptivo para la introspección de base de datos
COMMENT ON COLUMN public.catalogo_complementos.niveles_sugeridos IS 'Arreglo de niveles (ej: Inicial, Primaria) donde este complemento es aplicable.';
COMMENT ON COLUMN public.catalogo_complementos.ejemplo_uso IS 'Ejemplo concreto de cómo redactar este complemento en un PDC.';

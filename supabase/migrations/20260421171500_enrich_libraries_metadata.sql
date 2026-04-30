-- Migration: Align Instances with BasedeDatos.md (Corrected)
-- Description: Adds missing example fields (ejemplo_inicial, etc.) to instance tables 
--              to match the structure defined in BasedeDatos.md.
-- Note: This migration does NOT add difficulty or instrumento_sugerido to non-evaluation tables.

BEGIN;

-- 1. ADICIÓN DE EJEMPLOS POR NIVEL EN INSTANCIAS (TABLAS DEL PDC)
-- Estos campos están en el MD pero faltan en el SQL maestro para estas tablas.

ALTER TABLE public.teoria 
    ADD COLUMN IF NOT EXISTS ejemplo_inicial TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_primaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_secundaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_multigrado TEXT;

ALTER TABLE public.practica 
    ADD COLUMN IF NOT EXISTS ejemplo_inicial TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_primaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_secundaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_multigrado TEXT;

ALTER TABLE public.produccion 
    ADD COLUMN IF NOT EXISTS ejemplo_inicial TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_primaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_secundaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_multigrado TEXT;

ALTER TABLE public.valoracion 
    ADD COLUMN IF NOT EXISTS ejemplo_inicial TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_primaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_secundaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_multigrado TEXT;

ALTER TABLE public.recursos 
    ADD COLUMN IF NOT EXISTS ejemplo_inicial TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_primaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_secundaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_multigrado TEXT;

ALTER TABLE public.biblioteca_adaptaciones_basicas
    ADD COLUMN IF NOT EXISTS descripcion_situacion TEXT;

ALTER TABLE public.adaptaciones_basicas 
    ADD COLUMN IF NOT EXISTS descripcion_situacion TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_inicial TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_primaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_secundaria TEXT,
    ADD COLUMN IF NOT EXISTS ejemplo_multigrado TEXT;

COMMIT;

-- =========================================================================
-- MIGRACIÓN: Alineación de Bibliotecas y Momentos (Step 8)
-- Fecha: 2026-04-22
-- Descripción: Añade campos necesarios para selectores jerárquicos y detalles
--              según el archivo de requisitos req1.md.
-- =========================================================================

BEGIN;

-- 0. ENRIQUECIMIENTO DE PRÁCTICA
ALTER TABLE public.biblioteca_practica 
    ADD COLUMN IF NOT EXISTS proposito TEXT;

ALTER TABLE public.practica 
    ADD COLUMN IF NOT EXISTS proposito TEXT;

-- 1. ENRIQUECIMIENTO DE TEORÍA
ALTER TABLE public.biblioteca_teoria 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS tipo TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

ALTER TABLE public.teoria 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS tipo TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 2. ENRIQUECIMIENTO DE PRODUCCIÓN
ALTER TABLE public.biblioteca_produccion 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS nivel TEXT,
    ADD COLUMN IF NOT EXISTS subnivel TEXT,
    ADD COLUMN IF NOT EXISTS tipo TEXT,
    ADD COLUMN IF NOT EXISTS instrumento TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

ALTER TABLE public.produccion 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS nivel TEXT,
    ADD COLUMN IF NOT EXISTS subnivel TEXT,
    ADD COLUMN IF NOT EXISTS tipo TEXT,
    ADD COLUMN IF NOT EXISTS instrumento TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 3. ENRIQUECIMIENTO DE VALORACIÓN
ALTER TABLE public.biblioteca_valoracion 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS instrumento TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

ALTER TABLE public.valoracion 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS instrumento TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 4. ENRIQUECIMIENTO DE ADAPTACIONES
ALTER TABLE public.biblioteca_adaptaciones_basicas 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

ALTER TABLE public.adaptaciones_basicas 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 5. ENRIQUECIMIENTO DE RECURSOS
ALTER TABLE public.biblioteca_recursos 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

ALTER TABLE public.recursos 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 6. PERMISOS Y SEGURIDAD (Asegurar que los roles tengan acceso a los nuevos campos)
DO $$
DECLARE
    tablas_bib TEXT[] := ARRAY['biblioteca_practica', 'biblioteca_teoria', 'biblioteca_produccion', 'biblioteca_valoracion', 'biblioteca_recursos', 'biblioteca_adaptaciones_basicas'];
    tablas_ins TEXT[] := ARRAY['practica', 'teoria', 'produccion', 'valoracion', 'recursos', 'adaptaciones_basicas'];
    t TEXT;
BEGIN
    -- Permisos para Bibliotecas (Lectura para todos, gestión para autenticados)
    FOREACH t IN ARRAY tablas_bib LOOP
        EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated;', t);
        EXECUTE format('GRANT ALL ON public.%I TO authenticated;', t);
    END LOOP;

    -- Permisos para Instancias (Gestión para autenticados)
    FOREACH t IN ARRAY tablas_ins LOOP
        EXECUTE format('GRANT ALL ON public.%I TO authenticated;', t);
    END LOOP;
END $$;

COMMIT;

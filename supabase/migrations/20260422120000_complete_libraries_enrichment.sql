-- =========================================================================
-- MIGRACIÓN: Enriquecimiento Final de Bibliotecas y Fuentes
-- Fecha: 2026-04-22
-- Descripción: Añade campos de metadatos faltantes y establece la relación
--              formal entre biblioteca_mi_fuente y tipo_fuente.
-- =========================================================================

BEGIN;

-- 1. ENRIQUECIMIENTO DE TEORÍA Y PRÁCTICA
ALTER TABLE public.biblioteca_teoria ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;
ALTER TABLE public.teoria ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;

ALTER TABLE public.biblioteca_practica ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;
ALTER TABLE public.biblioteca_practica ADD COLUMN IF NOT EXISTS apto_para TEXT;
ALTER TABLE public.practica ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;
ALTER TABLE public.practica ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 2. ENRIQUECIMIENTO DE PRODUCCIÓN
ALTER TABLE public.biblioteca_produccion ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;
ALTER TABLE public.produccion ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;

-- 3. AJUSTE DE RELACIÓN Y CAMPOS PARA FUENTES
-- Convertimos el campo 'tipo' a INTEGER para que coincida con id_tipo_fuente
ALTER TABLE public.biblioteca_mi_fuente 
    ALTER COLUMN tipo TYPE INTEGER USING (CASE WHEN tipo ~ '^[0-9]+$' THEN tipo::integer ELSE NULL END);

-- Añadimos la relación formal de llave foránea
ALTER TABLE public.biblioteca_mi_fuente
    ADD CONSTRAINT fk_biblioteca_mi_fuente_tipo_fuente 
    FOREIGN KEY (tipo) REFERENCES public.tipo_fuente(id_tipo_fuente)
    ON DELETE SET NULL;

ALTER TABLE public.biblioteca_mi_fuente ADD COLUMN IF NOT EXISTS apto_para TEXT;
ALTER TABLE public.mi_fuente ADD COLUMN IF NOT EXISTS apto_para TEXT;

-- 4. REFUERZO DE PERMISOS
-- Aseguramos que los roles tengan acceso a los nuevos campos
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

COMMIT;

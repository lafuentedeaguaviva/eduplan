-- Migración: Corregir nombres de columnas y añadir campos faltantes (Versión Robusta v2)
-- Objetivo: Sincronizar nombres de columnas, añadir metadatos y subcategoría de valoración.

-- 1. Renombrar columna solo si existe el nombre antiguo
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'valoracion' 
             AND column_name = 'id_biblioteca_valoracion') THEN
    ALTER TABLE public.valoracion RENAME COLUMN id_biblioteca_valoracion TO codigo_biblioteca_valoracion;
  END IF;

  -- 2. Añadir subcategoria e instrumento a valoracion si no existen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'valoracion' 
                 AND column_name = 'subcategoria') THEN
    ALTER TABLE public.valoracion ADD COLUMN subcategoria TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'valoracion' 
                 AND column_name = 'instrumento') THEN
    ALTER TABLE public.valoracion ADD COLUMN instrumento TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'valoracion' 
                 AND column_name = 'proposito') THEN
    ALTER TABLE public.valoracion ADD COLUMN proposito TEXT;
  END IF;
END $$;

-- 3. Asegurar campos en produccion
ALTER TABLE public.produccion 
    ADD COLUMN IF NOT EXISTS nivel TEXT,
    ADD COLUMN IF NOT EXISTS subnivel TEXT,
    ADD COLUMN IF NOT EXISTS tipo TEXT,
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;

-- 4. Asegurar campos en practica
ALTER TABLE public.practica 
    ADD COLUMN IF NOT EXISTS tipo TEXT,
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;

-- 5. Asegurar campos en teoria
ALTER TABLE public.teoria 
    ADD COLUMN IF NOT EXISTS tipo TEXT,
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS descripcion_concreta TEXT;

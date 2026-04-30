-- Migración: Estandarización de Adaptaciones Curriculares (Librería y Planificación)
-- Objetivo: Sincronizar nombres de columnas y limpiar campos innecesarios en biblioteca.

DO $$ 
BEGIN 
  -- 1. Renombrar columna en la tabla de planificación 'adaptaciones_basicas'
  -- Solo procedemos si la columna destino NO existe todavía
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'adaptaciones_basicas' 
                 AND column_name = 'codigo_biblioteca_adaptacion') THEN
    
    -- Intentamos desde id_biblioteca_adaptacion
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'adaptaciones_basicas' 
               AND column_name = 'id_biblioteca_adaptacion') THEN
      ALTER TABLE public.adaptaciones_basicas RENAME COLUMN id_biblioteca_adaptacion TO codigo_biblioteca_adaptacion;
    
    -- O desde codigo_biblioteca_adaptaciones_basicas
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'adaptaciones_basicas' 
               AND column_name = 'codigo_biblioteca_adaptaciones_basicas') THEN
      ALTER TABLE public.adaptaciones_basicas RENAME COLUMN codigo_biblioteca_adaptaciones_basicas TO codigo_biblioteca_adaptacion;
    END IF;

  END IF;

  -- 2. Limpieza de la tabla de biblioteca 'biblioteca_adaptaciones_basicas'
  
  -- Quitar redactado_ia si existe
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'biblioteca_adaptaciones_basicas' 
             AND column_name = 'redactado_ia') THEN
    ALTER TABLE public.biblioteca_adaptaciones_basicas DROP COLUMN redactado_ia;
  END IF;

  -- Quitar columnas de ejemplos
  ALTER TABLE public.biblioteca_adaptaciones_basicas 
    DROP COLUMN IF EXISTS ejemplo_inicial,
    DROP COLUMN IF EXISTS ejemplo_primaria,
    DROP COLUMN IF EXISTS ejemplo_secundaria,
    DROP COLUMN IF EXISTS ejemplo_multigrado;

  -- 3. Asegurar campos de metadatos en 'adaptaciones_basicas'
  ALTER TABLE public.adaptaciones_basicas 
    ADD COLUMN IF NOT EXISTS proposito TEXT,
    ADD COLUMN IF NOT EXISTS apto_para TEXT;

END $$;

-- Forzar recarga de esquema
NOTIFY pgrst, 'reload schema';

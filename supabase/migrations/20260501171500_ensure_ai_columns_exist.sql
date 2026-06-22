-- Migración de Emergencia: Asegurar columnas de IA en planificacion_semanal
-- Objetivo: Garantizar que las columnas necesarias para el reporte (Paso 12) existan.

DO $$ 
BEGIN 
  -- 1. Asegurar momentos_ia
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'planificacion_semanal' 
                 AND column_name = 'momentos_ia') THEN
    ALTER TABLE public.planificacion_semanal ADD COLUMN momentos_ia TEXT DEFAULT '';
  END IF;

  -- 2. Asegurar recursos_fuentes_ia (y manejar legado)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'planificacion_semanal' 
                 AND column_name = 'recursos_fuentes_ia') THEN
    
    -- Si existe la versión vieja con "y", la renombramos
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'planificacion_semanal' 
               AND column_name = 'recursos_y_fuentes_ia') THEN
      ALTER TABLE public.planificacion_semanal RENAME COLUMN recursos_y_fuentes_ia TO recursos_fuentes_ia;
    ELSE
      ALTER TABLE public.planificacion_semanal ADD COLUMN recursos_fuentes_ia TEXT DEFAULT '';
    END IF;
  END IF;

  -- 3. Asegurar adaptaciones
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'planificacion_semanal' 
                 AND column_name = 'adaptaciones_basicas_ia') THEN
    ALTER TABLE public.planificacion_semanal ADD COLUMN adaptaciones_basicas_ia TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'planificacion_semanal' 
                 AND column_name = 'adaptaciones_especiales_ia') THEN
    ALTER TABLE public.planificacion_semanal ADD COLUMN adaptaciones_especiales_ia TEXT DEFAULT '';
  END IF;

END $$;

-- Recargar esquema para PostgREST
NOTIFY pgrst, 'reload schema';

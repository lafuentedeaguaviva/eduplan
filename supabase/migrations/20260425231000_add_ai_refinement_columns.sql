-- Migración: Adición de columnas para Refinamiento IA (Pasos 11 y 12)
-- Objetivo: Persistir preferencias de IA y resultados de optimización batch.

DO $$ 
BEGIN 
  -- 1. Columnas en la tabla maestra 'pdcs'
  ALTER TABLE public.pdcs 
    ADD COLUMN IF NOT EXISTS escritura_tipo_ia TEXT,
    ADD COLUMN IF NOT EXISTS correccion_profundidad_ia TEXT,
    ADD COLUMN IF NOT EXISTS evaluacion_tipo_ia TEXT;

  -- 2. Columnas en la tabla 'planificacion_semanal'
  
  -- Renombrar recursos_y_fuentes_ia a recursos_fuentes_ia si existe para estandarizar con tipos TS
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_schema = 'public' 
             AND table_name = 'planificacion_semanal' 
             AND column_name = 'recursos_y_fuentes_ia') THEN
    
    -- Si ya existe la de destino, movemos datos y borramos la vieja
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'planificacion_semanal' 
               AND column_name = 'recursos_fuentes_ia') THEN
      UPDATE public.planificacion_semanal SET recursos_fuentes_ia = recursos_y_fuentes_ia WHERE recursos_fuentes_ia IS NULL OR recursos_fuentes_ia = '';
      ALTER TABLE public.planificacion_semanal DROP COLUMN recursos_y_fuentes_ia;
    ELSE
      ALTER TABLE public.planificacion_semanal RENAME COLUMN recursos_y_fuentes_ia TO recursos_fuentes_ia;
    END IF;
  ELSE
    ALTER TABLE public.planificacion_semanal ADD COLUMN IF NOT EXISTS recursos_fuentes_ia TEXT DEFAULT '';
  END IF;

  -- Agregar adaptaciones_basicas_ia y adaptaciones_especiales_ia
  ALTER TABLE public.planificacion_semanal 
    ADD COLUMN IF NOT EXISTS adaptaciones_basicas_ia TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS adaptaciones_especiales_ia TEXT DEFAULT '';

END $$;

-- Forzar recarga de esquema para PostgREST
NOTIFY pgrst, 'reload schema';

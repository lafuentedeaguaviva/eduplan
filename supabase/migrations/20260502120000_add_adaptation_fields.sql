-- Migration: Add adaptaciones_no_significativas (original) to pdcs_area_trabajo
-- Also ensure the IA fields exist if they weren't created correctly before

DO $$ 
BEGIN
    -- Add adaptaciones_no_significativas (original)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pdcs_area_trabajo' AND column_name = 'adaptaciones_no_significativas') THEN
        ALTER TABLE public.pdcs_area_trabajo ADD COLUMN adaptaciones_no_significativas TEXT DEFAULT '';
    END IF;

    -- Ensure IA fields exist (defensive)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pdcs_area_trabajo' AND column_name = 'adaptaciones_no_significativas_ia') THEN
        ALTER TABLE public.pdcs_area_trabajo ADD COLUMN adaptaciones_no_significativas_ia TEXT DEFAULT '';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pdcs_area_trabajo' AND column_name = 'criterios_evaluacion_adaptaciones_ia') THEN
        ALTER TABLE public.pdcs_area_trabajo ADD COLUMN criterios_evaluacion_adaptaciones_ia TEXT DEFAULT '';
    END IF;
END $$;

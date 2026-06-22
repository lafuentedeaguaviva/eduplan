-- Migration to add pdc_estado column to pdc_revisiones
ALTER TABLE public.pdc_revisiones ADD COLUMN IF NOT EXISTS pdc_estado TEXT DEFAULT 'En proceso';

-- Also ensure the enum has 'finalizado' just in case they want to use it there too
ALTER TYPE pdc_revision_status ADD VALUE IF NOT EXISTS 'finalizado';

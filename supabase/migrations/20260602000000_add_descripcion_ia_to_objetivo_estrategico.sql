-- Migration to add descripcion_ia back to objetivo_estrategico
ALTER TABLE public.objetivo_estrategico ADD COLUMN IF NOT EXISTS descripcion_ia text;

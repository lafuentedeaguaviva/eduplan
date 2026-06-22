-- Migration to drop descripcion_ia from objetivo_estrategico
ALTER TABLE public.objetivo_estrategico DROP COLUMN IF EXISTS descripcion_ia;

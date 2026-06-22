-- Renombrar columna de IA para objetivo_estrategico
ALTER TABLE public.pdcs_area_trabajo 
RENAME COLUMN objetivo_estrategica_ai TO objetivo_estrategico_ia;

-- Migración: Añadir vínculos de biblioteca a las tablas de instancias de momentos
-- Objetivo: Permitir que cada actividad guardada mantenga una referencia a su origen en la biblioteca.

BEGIN;

ALTER TABLE public.adaptaciones_basicas 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_adaptaciones_basicas BIGINT;

ALTER TABLE public.practica 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_practica BIGINT;

ALTER TABLE public.teoria 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_teoria BIGINT;

ALTER TABLE public.produccion 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_produccion BIGINT;

ALTER TABLE public.valoracion 
    ADD COLUMN IF NOT EXISTS id_biblioteca_valoracion BIGINT;

ALTER TABLE public.recursos 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_recursos BIGINT;

ALTER TABLE public.mi_fuente 
    ADD COLUMN IF NOT EXISTS codigo_biblioteca_mi_fuente BIGINT;

COMMIT;

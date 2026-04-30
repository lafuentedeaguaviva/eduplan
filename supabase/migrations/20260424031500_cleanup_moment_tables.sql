-- Migración: Limpieza de columnas redundantes en tablas de momentos formativos
-- Objetivo: Eliminar campos de ejemplos y metadatos que ahora residen únicamente en las bibliotecas o son obsoletos.

ALTER TABLE public.teoria 
    DROP COLUMN IF EXISTS redactado_ia,
    DROP COLUMN IF EXISTS ejemplo_inicial,
    DROP COLUMN IF EXISTS ejemplo_primaria,
    DROP COLUMN IF EXISTS ejemplo_secundaria,
    DROP COLUMN IF EXISTS ejemplo_multigrado,
    DROP COLUMN IF EXISTS apto_para;

ALTER TABLE public.practica 
    DROP COLUMN IF EXISTS redactado_ia,
    DROP COLUMN IF EXISTS ejemplo_inicial,
    DROP COLUMN IF EXISTS ejemplo_primaria,
    DROP COLUMN IF EXISTS ejemplo_secundaria,
    DROP COLUMN IF EXISTS ejemplo_multigrado,
    DROP COLUMN IF EXISTS apto_para;

ALTER TABLE public.produccion 
    DROP COLUMN IF EXISTS redactado_ia,
    DROP COLUMN IF EXISTS ejemplo_inicial,
    DROP COLUMN IF EXISTS ejemplo_primaria,
    DROP COLUMN IF EXISTS ejemplo_secundaria,
    DROP COLUMN IF EXISTS ejemplo_multigrado,
    DROP COLUMN IF EXISTS apto_para;

ALTER TABLE public.valoracion 
    DROP COLUMN IF EXISTS redactado_ia,
    DROP COLUMN IF EXISTS ejemplo_inicial,
    DROP COLUMN IF EXISTS ejemplo_primaria,
    DROP COLUMN IF EXISTS ejemplo_secundaria,
    DROP COLUMN IF EXISTS ejemplo_multigrado,
    DROP COLUMN IF EXISTS apto_para;

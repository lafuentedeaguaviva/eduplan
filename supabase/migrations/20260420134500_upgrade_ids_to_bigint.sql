-- =========================================================================
-- MIGRACIÓN: Upgrade IDs de contenidos a BIGINT (Integer Largo)
-- Fecha: 2026-04-20
-- =========================================================================

BEGIN;

-- 1. ELIMINAR LLAVES FORÁNEAS TEMPORALMENTE
-- -------------------------------------------------------------------------

-- De contenidos_base (self-reference)
ALTER TABLE public.contenidos_base DROP CONSTRAINT IF EXISTS contenidos_base_padre_id_fkey;

-- De contenidos_usuario
ALTER TABLE public.contenidos_usuario DROP CONSTRAINT IF EXISTS contenidos_usuario_origen_base_id_fkey;
ALTER TABLE public.contenidos_usuario DROP CONSTRAINT IF EXISTS contenidos_usuario_padre_id_fkey;

-- De semana_contenido
ALTER TABLE public.semana_contenido DROP CONSTRAINT IF EXISTS semana_contenido_contenido_usuario_id_fkey;

-- De objetivo_estrategico_contenido
ALTER TABLE public.objetivo_estrategico_contenido DROP CONSTRAINT IF EXISTS objetivo_estrategico_contenido_contenido_usuario_id_fkey;


-- 2. ALTERAR TIPOS DE COLUMNAS (PK y FK)
-- -------------------------------------------------------------------------

-- Tabla: contenidos_base
ALTER TABLE public.contenidos_base ALTER COLUMN id TYPE BIGINT;
ALTER TABLE public.contenidos_base ALTER COLUMN padre_id TYPE BIGINT;

-- Tabla: contenidos_usuario
ALTER TABLE public.contenidos_usuario ALTER COLUMN id TYPE BIGINT;
ALTER TABLE public.contenidos_usuario ALTER COLUMN origen_base_id TYPE BIGINT;
ALTER TABLE public.contenidos_usuario ALTER COLUMN padre_id TYPE BIGINT;

-- Tabla: semana_contenido
ALTER TABLE public.semana_contenido ALTER COLUMN contenido_usuario_id TYPE BIGINT;

-- Tabla: objetivo_estrategico_contenido
ALTER TABLE public.objetivo_estrategico_contenido ALTER COLUMN contenido_usuario_id TYPE BIGINT;


-- 3. ACTUALIZAR SECUENCIAS
-- -------------------------------------------------------------------------
-- Postgres 'SERIAL' crea una secuencia. Al cambiar a BIGINT, debemos asegurar que la secuencia sea de 64-bit.

ALTER SEQUENCE IF EXISTS public.contenidos_base_id_seq AS BIGINT;
ALTER SEQUENCE IF EXISTS public.contenidos_usuario_id_seq AS BIGINT;


-- 4. RE-ESTABLECER LLAVES FORÁNEAS
-- -------------------------------------------------------------------------

-- contenidos_base -> contenidos_base
ALTER TABLE public.contenidos_base 
ADD CONSTRAINT contenidos_base_padre_id_fkey 
FOREIGN KEY (padre_id) REFERENCES public.contenidos_base(id) ON DELETE CASCADE;

-- contenidos_usuario -> contenidos_base
ALTER TABLE public.contenidos_usuario 
ADD CONSTRAINT contenidos_usuario_origen_base_id_fkey 
FOREIGN KEY (origen_base_id) REFERENCES public.contenidos_base(id) ON DELETE SET NULL;

-- contenidos_usuario -> contenidos_usuario
ALTER TABLE public.contenidos_usuario 
ADD CONSTRAINT contenidos_usuario_padre_id_fkey 
FOREIGN KEY (padre_id) REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE;

-- semana_contenido -> contenidos_usuario
ALTER TABLE public.semana_contenido 
ADD CONSTRAINT semana_contenido_contenido_usuario_id_fkey 
FOREIGN KEY (contenido_usuario_id) REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE;

-- objetivo_estrategico_contenido -> contenidos_usuario
ALTER TABLE public.objetivo_estrategico_contenido 
ADD CONSTRAINT objetivo_estrategico_contenido_contenido_usuario_id_fkey 
FOREIGN KEY (contenido_usuario_id) REFERENCES public.contenidos_usuario(id) ON DELETE CASCADE;

COMMIT;

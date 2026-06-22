
-- =========================================================================
-- MIGRACIÓN: Corregir Políticas RLS y Tipos BIGINT para contenidos_usuario
-- Fecha: 2026-05-09
-- =========================================================================

BEGIN;

-- 1. Asegurar tipos BIGINT (Garantía técnica)
ALTER TABLE public.contenidos_usuario ALTER COLUMN padre_id TYPE BIGINT;
ALTER TABLE public.contenidos_usuario ALTER COLUMN origen_base_id TYPE BIGINT;
ALTER TABLE public.contenidos_usuario ALTER COLUMN id TYPE BIGINT;

-- 2. Refrescar Políticas RLS (Corregir posibles bloqueos de visibilidad)
ALTER TABLE public.contenidos_usuario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gestionar contenidos propios" ON public.contenidos_usuario;
DROP POLICY IF EXISTS "Ver contenidos propios" ON public.contenidos_usuario;
DROP POLICY IF EXISTS "Crear contenidos propios" ON public.contenidos_usuario;
DROP POLICY IF EXISTS "Editar contenidos propios" ON public.contenidos_usuario;
DROP POLICY IF EXISTS "Borrar contenidos propios" ON public.contenidos_usuario;

-- Política para SELECT (Permitir ver a profesor y director asignado)
CREATE POLICY "Ver contenidos propios" 
ON public.contenidos_usuario FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.areas_trabajo 
    WHERE id = public.contenidos_usuario.area_trabajo_id 
    AND (profesor_id = auth.uid() OR director_id = auth.uid())
  )
);

-- Política para INSERT (Solo profesor)
CREATE POLICY "Crear contenidos propios" 
ON public.contenidos_usuario FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.areas_trabajo 
    WHERE id = public.contenidos_usuario.area_trabajo_id 
    AND profesor_id = auth.uid()
  )
);

-- Política para UPDATE (Solo profesor)
CREATE POLICY "Editar contenidos propios" 
ON public.contenidos_usuario FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.areas_trabajo 
    WHERE id = public.contenidos_usuario.area_trabajo_id 
    AND profesor_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.areas_trabajo 
    WHERE id = public.contenidos_usuario.area_trabajo_id 
    AND profesor_id = auth.uid()
  )
);

-- Política para DELETE (Solo profesor)
CREATE POLICY "Borrar contenidos propios" 
ON public.contenidos_usuario FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.areas_trabajo 
    WHERE id = public.contenidos_usuario.area_trabajo_id 
    AND profesor_id = auth.uid()
  )
);

COMMIT;

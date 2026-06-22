-- =========================================================================
-- MIGRACIÓN: Corregir visibilidad de roles (RLS)
-- Fecha: 2026-05-04
-- Descripción: Permite que los usuarios autenticados vean sus propios roles asociados.
-- =========================================================================

DROP POLICY IF EXISTS "Usuarios ven sus propios roles" ON public.perfil_roles;

CREATE POLICY "Usuarios ven sus propios roles" 
ON public.perfil_roles 
FOR SELECT 
TO authenticated 
USING (perfil_id = auth.uid());

-- Comentario para introspección
COMMENT ON POLICY "Usuarios ven sus propios roles" ON public.perfil_roles IS 'Garantiza que cada usuario solo pueda consultar sus propios roles asignados.';

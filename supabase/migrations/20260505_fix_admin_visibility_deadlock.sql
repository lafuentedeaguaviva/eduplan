-- Migration: 20260505_fix_admin_visibility_deadlock.sql
-- Description: Resolve RLS deadlock and ensure administrators can see roles and assignments.

-- 1. Permite visibilidad global de las asignaciones de roles para usuarios autenticados.
-- Esto es necesario para evitar recursión en las funciones de verificación de roles
-- y permitir que el sistema funcione correctamente (conocer qué roles tiene cada uno).
DROP POLICY IF EXISTS "Usuarios ven sus propios roles" ON public.perfil_roles;
DROP POLICY IF EXISTS "Admins see all roles" ON public.perfil_roles;
DROP POLICY IF EXISTS "Public roles visibility" ON public.perfil_roles;

CREATE POLICY "Public roles visibility" 
    ON public.perfil_roles 
    FOR SELECT 
    TO authenticated 
    USING (true);

-- 2. Asegura que los administradores puedan gestionar las asignaciones
DROP POLICY IF EXISTS "Admins manage perfil_roles" ON public.perfil_roles;
CREATE POLICY "Admins manage perfil_roles" 
    ON public.perfil_roles 
    FOR ALL 
    TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 3. Asegura que los administradores puedan ver y gestionar la tabla maestra de roles
DROP POLICY IF EXISTS "Admins manage roles" ON public.roles;
CREATE POLICY "Admins manage roles" ON public.roles
    FOR ALL 
    TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 4. Permite visibilidad de la tabla maestra de roles para todos (necesario para selects y comparaciones)
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles" 
    ON public.roles 
    FOR SELECT 
    TO authenticated 
    USING (true);

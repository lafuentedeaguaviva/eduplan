-- Migration: 20260505_admin_roles_management.sql
-- Description: Allow administrators to manage roles and profiles.

-- 1. Ensure RLS for roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage roles" ON public.roles;
CREATE POLICY "Admins manage roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 2. Ensure RLS for perfil_roles table (re-check)
-- This was already touched in 20260504190000_fix_perfil_roles_rls.sql, but let's be sure.
DROP POLICY IF EXISTS "Admins manage perfil_roles" ON public.perfil_roles;
CREATE POLICY "Admins manage perfil_roles" ON public.perfil_roles
    FOR ALL
    TO authenticated
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 3. Ensure perfiles can be managed by Admin
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.perfiles;
CREATE POLICY "Admins manage all profiles" ON public.perfiles
    FOR ALL
    TO authenticated
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

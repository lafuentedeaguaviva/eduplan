-- Migration: 20260505_restrict_roles_to_admin.sql
-- Description: Restrict roles and assignments visibility to ONLY administrators.

-- 1. Remove the public visibility policy
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;

-- 2. Ensure ONLY admins can view/manage roles
DROP POLICY IF EXISTS "Admins manage roles" ON public.roles;
CREATE POLICY "Admins manage roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 3. Restrict perfil_roles: Users see THEIR OWN roles, Admins see ALL
DROP POLICY IF EXISTS "Usuarios ven sus propios roles" ON public.perfil_roles;
CREATE POLICY "Usuarios ven sus propios roles" 
    ON public.perfil_roles 
    FOR SELECT 
    TO authenticated 
    USING (perfil_id = auth.uid());

DROP POLICY IF EXISTS "Admins see all roles" ON public.perfil_roles;
CREATE POLICY "Admins see all roles" 
    ON public.perfil_roles 
    FOR SELECT 
    TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'));

DROP POLICY IF EXISTS "Admins manage perfil_roles" ON public.perfil_roles;
CREATE POLICY "Admins manage perfil_roles" 
    ON public.perfil_roles 
    FOR ALL 
    TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

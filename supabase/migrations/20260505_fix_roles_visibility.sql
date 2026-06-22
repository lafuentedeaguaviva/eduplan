-- Migration: 20260505_fix_roles_visibility.sql
-- Description: Allow all authenticated users to view roles, but only admins to manage them.

-- 1. Allow everyone to see roles (Select)
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles" ON public.roles
    FOR SELECT
    TO authenticated
    USING (true);

-- 2. Keep admin management (Insert, Update, Delete)
DROP POLICY IF EXISTS "Admins manage roles" ON public.roles;
CREATE POLICY "Admins manage roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 3. Ensure everyone can see role assignments for themselves
DROP POLICY IF EXISTS "Users can see their own roles" ON public.perfil_roles;
CREATE POLICY "Users can see their own roles" 
    ON public.perfil_roles 
    FOR SELECT 
    TO authenticated 
    USING (perfil_id = auth.uid());

-- 4. Admins can see all assignments
DROP POLICY IF EXISTS "Admins see all roles" ON public.perfil_roles;
CREATE POLICY "Admins see all roles" 
    ON public.perfil_roles 
    FOR SELECT 
    TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'));

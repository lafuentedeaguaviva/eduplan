-- Migration: 20260505_fix_perfiles_admin_visibility.sql
-- Description: Allow Administrators to see all user profiles.

-- 1. Ensure RLS is enabled
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to see their own profile
DROP POLICY IF EXISTS "Users can see their own profile" ON public.perfiles;
CREATE POLICY "Users can see their own profile"
    ON public.perfiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 3. Allow admins to see ALL profiles
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.perfiles;
CREATE POLICY "Admins can see all profiles"
    ON public.perfiles
    FOR SELECT
    TO authenticated
    USING (public.usuario_tiene_rol('Administrador'));

-- 4. Allow admins to manage profiles (Insert/Update/Delete)
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.perfiles;
CREATE POLICY "Admins can manage profiles"
    ON public.perfiles
    FOR ALL
    TO authenticated
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

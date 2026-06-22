-- Migration: 20260505_fix_visibility_simple.sql
-- Description: Simple policy to ensure visibility for authenticated users.

DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles" ON public.roles
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Public roles visibility" ON public.perfil_roles;
CREATE POLICY "Public roles visibility" ON public.perfil_roles
    FOR SELECT
    TO authenticated
    USING (true);

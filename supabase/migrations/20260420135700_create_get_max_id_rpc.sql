-- =========================================================================
-- MIGRACIÓN: Crear RPC get_max_user_content_id (BIGINT)
-- Fecha: 2026-04-20
-- =========================================================================

-- Esta función es necesaria para el copiado masivo de contenidos (copyAllBaseContentsToUser)
-- Se define como SECURITY DEFINER para que pueda consultar el máximo ID global 
-- saltándose las políticas de RLS del usuario actual.

CREATE OR REPLACE FUNCTION public.get_max_user_content_id()
RETURNS BIGINT AS $$
BEGIN
    RETURN COALESCE((SELECT MAX(id) FROM public.contenidos_usuario), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_max_user_content_id() TO authenticated;

-- ============================================
-- MIGRACIÓN: CONFIGURACIÓN GLOBAL DEL SISTEMA
-- Fecha: 2026-05-04
-- ============================================

-- 1. Creación de la Tabla
CREATE TABLE IF NOT EXISTS public.configuracion_global (
    id TEXT PRIMARY KEY DEFAULT 'current_config',
    gestion_actual INTEGER NOT NULL DEFAULT 2026,
    trimestre_actual INTEGER NOT NULL DEFAULT 1 CHECK (trimestre_actual BETWEEN 1 AND 3),
    ia_limit_per_user INTEGER NOT NULL DEFAULT 1500,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    allow_registration BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT singleton_row CHECK (id = 'current_config') -- Asegura que solo haya una fila de configuración
);

-- 2. Habilitar RLS
ALTER TABLE public.configuracion_global ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acceso
-- Todos los usuarios autenticados pueden leer la configuración
CREATE POLICY "Lectura pública configuración" 
    ON public.configuracion_global FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Solo los Administradores pueden gestionar la configuración
CREATE POLICY "Gestión total Administrador" 
    ON public.configuracion_global FOR ALL 
    TO authenticated 
    USING (public.usuario_tiene_rol('Administrador'))
    WITH CHECK (public.usuario_tiene_rol('Administrador'));

-- 4. Permisos de Rol
GRANT SELECT ON public.configuracion_global TO authenticated;
GRANT ALL ON public.configuracion_global TO authenticated; -- El acceso real lo filtra RLS

-- 5. Trigger para updated_at
DROP TRIGGER IF EXISTS tr_update_global_config_updated_at ON public.configuracion_global;
CREATE TRIGGER tr_update_global_config_updated_at 
    BEFORE UPDATE ON public.configuracion_global 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Inserción de Datos Iniciales (Seed)
INSERT INTO public.configuracion_global (id, gestion_actual, trimestre_actual, ia_limit_per_user)
VALUES ('current_config', 2026, 1, 1500)
ON CONFLICT (id) DO NOTHING;

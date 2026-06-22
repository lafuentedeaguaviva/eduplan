
-- Migration: Create ia_consumo_logs and set up RLS
-- Date: 2026-05-01

CREATE TABLE IF NOT EXISTS public.ia_consumo_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    tipo_operacion TEXT,
    proveedor TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ia_consumo_logs ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.ia_consumo_logs TO service_role;
GRANT INSERT, SELECT ON public.ia_consumo_logs TO authenticated;

-- Policy: Users can insert their own logs
DROP POLICY IF EXISTS "Users can insert their own consumption logs" ON public.ia_consumo_logs;
CREATE POLICY "Users can insert their own consumption logs" 
ON public.ia_consumo_logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = usuario_id);

-- Policy: Users can view their own logs
DROP POLICY IF EXISTS "Users can view their own consumption logs" ON public.ia_consumo_logs;
CREATE POLICY "Users can view their own consumption logs"
ON public.ia_consumo_logs FOR SELECT
TO authenticated
USING (auth.uid() = usuario_id);

-- Policy: Admins can view all logs
DROP POLICY IF EXISTS "Admins can view all consumption logs" ON public.ia_consumo_logs;
CREATE POLICY "Admins can view all consumption logs"
ON public.ia_consumo_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.perfil_roles
        WHERE perfil_id = auth.uid() AND rol_nombre = 'Administrador'
    )
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_ia_consumo_usuario ON public.ia_consumo_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ia_consumo_created_at ON public.ia_consumo_logs(created_at);

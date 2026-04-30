-- 20260430004500_create_pdc_revisiones.sql

-- 1. Create Enum for Status
CREATE TYPE pdc_revision_status AS ENUM ('enviado', 'observado', 'aprobado');

-- 2. Create the Snapshots Table
CREATE TABLE IF NOT EXISTS public.pdc_revisiones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pdc_origen_id UUID NOT NULL REFERENCES public.pdcs(id) ON DELETE CASCADE,
    profesor_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
    director_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
    materia TEXT,
    grado TEXT,
    nivel TEXT,
    estado pdc_revision_status DEFAULT 'enviado' NOT NULL,
    pdc_snapshot JSONB NOT NULL,
    observaciones JSONB,
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for fast dashboards
CREATE INDEX IF NOT EXISTS idx_pdc_revisiones_profesor ON public.pdc_revisiones(profesor_id);
CREATE INDEX IF NOT EXISTS idx_pdc_revisiones_director ON public.pdc_revisiones(director_id);
CREATE INDEX IF NOT EXISTS idx_pdc_revisiones_estado ON public.pdc_revisiones(estado);

-- 4. Enable RLS
ALTER TABLE public.pdc_revisiones ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Profesores pueden ver sus propias revisiones" 
    ON public.pdc_revisiones FOR SELECT 
    USING (auth.uid() = profesor_id);

CREATE POLICY "Profesores pueden crear sus revisiones" 
    ON public.pdc_revisiones FOR INSERT 
    WITH CHECK (auth.uid() = profesor_id);

CREATE POLICY "Profesores pueden actualizar sus revisiones" 
    ON public.pdc_revisiones FOR UPDATE 
    USING (auth.uid() = profesor_id);

-- Para directores usamos el helper existente en full_database_setup.sql
CREATE POLICY "Directores pueden ver todas las revisiones" 
    ON public.pdc_revisiones FOR SELECT 
    USING (public.usuario_tiene_rol('Director') OR public.usuario_tiene_rol('Administrador'));

CREATE POLICY "Directores pueden actualizar revisiones" 
    ON public.pdc_revisiones FOR UPDATE 
    USING (public.usuario_tiene_rol('Director') OR public.usuario_tiene_rol('Administrador'));

-- 6. Permissions
GRANT ALL ON public.pdc_revisiones TO authenticated;

-- 7. Trigger for updated_at
CREATE TRIGGER update_pdc_revisiones_modtime
    BEFORE UPDATE ON public.pdc_revisiones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

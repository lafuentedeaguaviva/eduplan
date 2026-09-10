-- Tabla para guardar el Material de Contenido Generado
CREATE TABLE public.material_contenido (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    docente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_trabajo_id UUID REFERENCES public.areas_trabajo(id) ON DELETE SET NULL,
    tema_padre_id INTEGER,
    titulo_tema VARCHAR(255) NOT NULL,
    subtemas_incluidos JSONB,
    pdc_revision_id UUID REFERENCES public.pdc_revisiones(id) ON DELETE SET NULL,
    config_usada JSONB,
    cuerpo_contenido TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'Finalizado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.material_contenido ENABLE ROW LEVEL SECURITY;

-- Política para que los profesores solo vean/editen sus propios contenidos
CREATE POLICY "Los docentes pueden ver sus propios contenidos" 
    ON public.material_contenido FOR SELECT 
    USING (auth.uid() = docente_id);

CREATE POLICY "Los docentes pueden insertar sus propios contenidos" 
    ON public.material_contenido FOR INSERT 
    WITH CHECK (auth.uid() = docente_id);

CREATE POLICY "Los docentes pueden actualizar sus propios contenidos" 
    ON public.material_contenido FOR UPDATE 
    USING (auth.uid() = docente_id);

CREATE POLICY "Los docentes pueden eliminar sus propios contenidos" 
    ON public.material_contenido FOR DELETE 
    USING (auth.uid() = docente_id);

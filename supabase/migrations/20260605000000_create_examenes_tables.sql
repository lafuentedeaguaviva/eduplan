-- Crear tabla examenes_generados
CREATE TABLE IF NOT EXISTS public.examenes_generados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    docente_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pdc_id UUID NOT NULL REFERENCES public.pdcs(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    narrativa_gamificada VARCHAR(255),
    archivo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para examenes_generados
ALTER TABLE public.examenes_generados ENABLE ROW LEVEL SECURITY;

-- Políticas para examenes_generados
CREATE POLICY "Los docentes pueden ver sus propios examenes"
    ON public.examenes_generados FOR SELECT
    USING (auth.uid() = docente_id);

CREATE POLICY "Los docentes pueden insertar sus propios examenes"
    ON public.examenes_generados FOR INSERT
    WITH CHECK (auth.uid() = docente_id);

CREATE POLICY "Los docentes pueden actualizar sus propios examenes"
    ON public.examenes_generados FOR UPDATE
    USING (auth.uid() = docente_id);

CREATE POLICY "Los docentes pueden eliminar sus propios examenes"
    ON public.examenes_generados FOR DELETE
    USING (auth.uid() = docente_id);


-- Crear tabla reactivos_examen
CREATE TABLE IF NOT EXISTS public.reactivos_examen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examen_id UUID NOT NULL REFERENCES public.examenes_generados(id) ON DELETE CASCADE,
    tipo_reactivo VARCHAR(50) NOT NULL,
    subtipo VARCHAR(100),
    nivel_bloom VARCHAR(50),
    dimension VARCHAR(50), -- Saber, Hacer, Ser
    enunciado_gamificado TEXT NOT NULL,
    opciones_json JSONB,
    respuesta_correcta TEXT,
    justificacion_docente TEXT,
    puntaje DECIMAL(5,2) DEFAULT 0.0
);

-- Habilitar RLS para reactivos_examen
ALTER TABLE public.reactivos_examen ENABLE ROW LEVEL SECURITY;

-- Políticas para reactivos_examen
CREATE POLICY "Acceso a reactivos mediante examen"
    ON public.reactivos_examen FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.examenes_generados
            WHERE id = reactivos_examen.examen_id
            AND docente_id = auth.uid()
        )
    );

-- Crear tabla instrumentos_calificacion (Listas de Cotejo, Rubricas)
CREATE TABLE IF NOT EXISTS public.instrumentos_calificacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    examen_id UUID NOT NULL REFERENCES public.examenes_generados(id) ON DELETE CASCADE,
    tipo_instrumento VARCHAR(50) NOT NULL, -- rubrica, lista_cotejo, escala_apreciacion
    dimension_evaluada VARCHAR(50) NOT NULL, -- Hacer, Ser
    criterios_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para instrumentos_calificacion
ALTER TABLE public.instrumentos_calificacion ENABLE ROW LEVEL SECURITY;

-- Políticas para instrumentos_calificacion
CREATE POLICY "Acceso a instrumentos mediante examen"
    ON public.instrumentos_calificacion FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.examenes_generados
            WHERE id = instrumentos_calificacion.examen_id
            AND docente_id = auth.uid()
        )
    );

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_examenes_docente ON public.examenes_generados(docente_id);
CREATE INDEX IF NOT EXISTS idx_examenes_pdc ON public.examenes_generados(pdc_id);
CREATE INDEX IF NOT EXISTS idx_reactivos_examen ON public.reactivos_examen(examen_id);
CREATE INDEX IF NOT EXISTS idx_instrumentos_examen ON public.instrumentos_calificacion(examen_id);

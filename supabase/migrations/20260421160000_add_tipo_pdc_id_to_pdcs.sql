-- Migration: Add tipo_pdc_id to pdcs
-- Description: Creates tipos_pdc catalog and adds the missing column to pdcs table.

BEGIN;

-- 1. Crear tabla de catálogo para los tipos de PDC
CREATE TABLE IF NOT EXISTS public.tipos_pdc (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insertar valores iniciales basados en la lógica del frontend (exportService.ts)
INSERT INTO public.tipos_pdc (id, nombre) VALUES
(1, 'PDC Inicial'),
(2, 'PDC Primaria'),
(3, 'PDC Secundaria'),
(4, 'PDC Multigrado')
ON CONFLICT (id) DO NOTHING;

-- 3. Añadir la columna faltante a la tabla pdcs
-- Se usa DEFAULT 2 (Primaria) para que los registros existentes no queden nulos y sean compatibles.
ALTER TABLE public.pdcs 
ADD COLUMN IF NOT EXISTS tipo_pdc_id INTEGER REFERENCES public.tipos_pdc(id) DEFAULT 2;

-- 4. Garantizar permisos
GRANT SELECT ON public.tipos_pdc TO authenticated;
GRANT ALL ON public.tipos_pdc TO service_role;

COMMIT;

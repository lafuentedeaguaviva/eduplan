-- =========================================================================
-- MIGRACIÓN: Deep Cascade for Areas de Trabajo
-- Fecha: 2026-04-21
-- Descripción: Asegura que al eliminar un área de trabajo, todos los registros 
--              relacionados se borren en cascada de forma determinista.
-- =========================================================================

-- 1. REFORZAR CONSTRAINTS EN TABLAS DEPENDIENTES DIRECTAS
-- ---------------------------------------------------------

-- Contenidos de Usuario
ALTER TABLE public.contenidos_usuario
DROP CONSTRAINT IF EXISTS contenidos_usuario_area_trabajo_id_fkey,
ADD CONSTRAINT contenidos_usuario_area_trabajo_id_fkey 
FOREIGN KEY (area_trabajo_id) 
REFERENCES public.areas_trabajo(id) 
ON DELETE CASCADE;

-- Planificación Semanal
ALTER TABLE public.planificacion_semanal
DROP CONSTRAINT IF EXISTS planificacion_semanal_area_trabajo_id_fkey,
ADD CONSTRAINT planificacion_semanal_area_trabajo_id_fkey 
FOREIGN KEY (area_trabajo_id) 
REFERENCES public.areas_trabajo(id) 
ON DELETE CASCADE;

-- Paralelos por Área
ALTER TABLE public.area_trabajo_paralelo
DROP CONSTRAINT IF EXISTS area_trabajo_paralelo_area_trabajo_id_fkey,
ADD CONSTRAINT area_trabajo_paralelo_area_trabajo_id_fkey 
FOREIGN KEY (area_trabajo_id) 
REFERENCES public.areas_trabajo(id) 
ON DELETE CASCADE;


-- 2. REFORZAR TRIGGER DE LIMPIEZA DE DISEÑOS (pdcs_area_trabajo)
-- ---------------------------------------------------------
-- El diseño (donde reside la IA) es el padre conceptual de muchas áreas
-- distribuidas, pero si el área borrada era la única usando ese diseño,
-- se borra el diseño y sus hijos (ser, saber, hacer, objetivos).

CREATE OR REPLACE FUNCTION public.cleanup_orphaned_pdc_designs()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el área que se borra tenía un diseño vinculado...
    IF OLD.pdc_area_trabajo_id IS NOT NULL THEN
        -- Y ninguna otra área está usando ese MISMO diseño...
        IF NOT EXISTS (
            SELECT 1 FROM public.areas_trabajo 
            WHERE pdc_area_trabajo_id = OLD.pdc_area_trabajo_id 
            AND id != OLD.id
        ) THEN
            -- Borramos el diseño (esto disparará CASCADE a ser, saber, hacer, etc.)
            DELETE FROM public.pdcs_area_trabajo WHERE id = OLD.pdc_area_trabajo_id;
        END IF;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Nos aseguramos que el trigger esté activo
DROP TRIGGER IF EXISTS trigger_cleanup_orphaned_designs ON public.areas_trabajo;
CREATE TRIGGER trigger_cleanup_orphaned_designs 
AFTER DELETE ON public.areas_trabajo 
FOR EACH ROW EXECUTE FUNCTION public.cleanup_orphaned_pdc_designs();


-- 3. LIMPIEZA INICIAL DE HUÉRFANOS (Mantenimiento)
-- ---------------------------------------------------------

-- Borrar diseños que no tienen ninguna área de trabajo apuntándoles
DELETE FROM public.pdcs_area_trabajo
WHERE id NOT IN (SELECT pdc_area_trabajo_id FROM public.areas_trabajo WHERE pdc_area_trabajo_id IS NOT NULL);

-- Borrar planificaciones semanales de áreas que ya no existen
DELETE FROM public.planificacion_semanal
WHERE area_trabajo_id NOT IN (SELECT id FROM public.areas_trabajo);

-- Borrar contenidos de usuario de áreas que ya no existen
DELETE FROM public.contenidos_usuario
WHERE area_trabajo_id NOT IN (SELECT id FROM public.areas_trabajo);

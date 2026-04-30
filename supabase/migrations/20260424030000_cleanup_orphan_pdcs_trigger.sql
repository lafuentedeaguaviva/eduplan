-- Migración: Limpieza automática de PDCs huérfanos
-- Objetivo: Si un PDC Maestro (pdcs) se queda sin áreas de trabajo asociadas, se elimina automáticamente.

CREATE OR REPLACE FUNCTION public.fn_cleanup_orphan_pdc()
RETURNS TRIGGER AS $$
DECLARE
    v_pdc_id UUID;
    v_pat_id UUID;
BEGIN
    -- Capturamos el ID del diseño de área (junction) que tenía el área borrada
    v_pat_id := OLD.pdc_area_trabajo_id;

    IF v_pat_id IS NOT NULL THEN
        -- 1. Verificar si quedan otras áreas vinculadas a este mismo diseño (pdcs_area_trabajo)
        -- Nota: Esto maneja el caso de diseños compartidos entre varias áreas.
        IF NOT EXISTS (SELECT 1 FROM public.areas_trabajo WHERE pdc_area_trabajo_id = v_pat_id) THEN
            
            -- Recuperar el ID del PDC Maestro antes de eliminar el diseño
            SELECT pdc_id INTO v_pdc_id FROM public.pdcs_area_trabajo WHERE id = v_pat_id;

            -- 2. Eliminar el registro de diseño (pdcs_area_trabajo)
            -- Esto disparará cascadas si están configuradas en la DB.
            DELETE FROM public.pdcs_area_trabajo WHERE id = v_pat_id;

            -- 3. Verificar si el PDC Maestro se quedó sin ningún diseño (sin ninguna área en absoluto)
            IF v_pdc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.pdcs_area_trabajo WHERE pdc_id = v_pdc_id) THEN
                -- 4. Eliminar el PDC Maestro huérfano
                DELETE FROM public.pdcs WHERE id = v_pdc_id;
            END IF;
        END IF;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Se ejecuta después de borrar un área de trabajo
DROP TRIGGER IF EXISTS tr_cleanup_orphan_pdc ON public.areas_trabajo;
CREATE TRIGGER tr_cleanup_orphan_pdc
AFTER DELETE ON public.areas_trabajo
FOR EACH ROW
EXECUTE FUNCTION public.fn_cleanup_orphan_pdc();

-- Comentario de documentación
COMMENT ON FUNCTION public.fn_cleanup_orphan_pdc() IS 'Elimina automáticamente PDCs y sus diseños si ya no tienen áreas de trabajo vinculadas.';

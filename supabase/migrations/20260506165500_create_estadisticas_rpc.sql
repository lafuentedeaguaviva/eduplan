-- Migration para agregar motor de estadísticas de PDCs (Momentos, Criterios, Adaptaciones)
-- Genera conteos agregados para dashboards sin necesidad de procesar los PDCs con IA.

CREATE OR REPLACE FUNCTION get_director_pdc_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
    v_unidad_educativa_id INTEGER;
BEGIN
    -- Obtener la unidad educativa del director actual
    SELECT id INTO v_unidad_educativa_id
    FROM unidades_educativas
    WHERE director_id = auth.uid()
    LIMIT 1;

    IF v_unidad_educativa_id IS NULL THEN
        RETURN json_build_object('error', 'El usuario actual no es director de ninguna unidad educativa.');
    END IF;

    SELECT json_build_object(
        'momentos', COALESCE((
            SELECT json_agg(row_to_json(m))
            FROM (
                SELECT 'Teoría' as categoria, t.nombre_estrategia_teorica as nombre, COUNT(*) as cantidad
                FROM teoria t
                JOIN planificacion_semanal ps ON t.planificacion_semanal_id = ps.id
                JOIN areas_trabajo at ON ps.area_trabajo_id = at.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND t.nombre_estrategia_teorica IS NOT NULL
                GROUP BY t.nombre_estrategia_teorica
                
                UNION ALL
                
                SELECT 'Práctica' as categoria, p.nombre_practica as nombre, COUNT(*) as cantidad
                FROM practica p
                JOIN planificacion_semanal ps ON p.planificacion_semanal_id = ps.id
                JOIN areas_trabajo at ON ps.area_trabajo_id = at.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND p.nombre_practica IS NOT NULL
                GROUP BY p.nombre_practica
                
                UNION ALL
                
                SELECT 'Producción' as categoria, pr.nombre_produccion as nombre, COUNT(*) as cantidad
                FROM produccion pr
                JOIN planificacion_semanal ps ON pr.planificacion_semanal_id = ps.id
                JOIN areas_trabajo at ON ps.area_trabajo_id = at.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND pr.nombre_produccion IS NOT NULL
                GROUP BY pr.nombre_produccion
                
                UNION ALL
                
                SELECT 'Valoración' as categoria, v.categoria as nombre, COUNT(*) as cantidad
                FROM valoracion v
                JOIN planificacion_semanal ps ON v.planificacion_semanal_id = ps.id
                JOIN areas_trabajo at ON ps.area_trabajo_id = at.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND v.categoria IS NOT NULL
                GROUP BY v.categoria
                
                ORDER BY cantidad DESC
            ) m
        ), '[]'::json),
        'criterios', COALESCE((
            SELECT json_agg(row_to_json(c))
            FROM (
                SELECT 'Ser' as categoria, s.nombre_ser as nombre, COUNT(*) as cantidad
                FROM ser s
                JOIN pdcs_area_trabajo pat ON pat.id = s.pdc_area_trabajo_id
                JOIN areas_trabajo at ON at.pdc_area_trabajo_id = pat.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND s.nombre_ser IS NOT NULL
                GROUP BY s.nombre_ser
                
                UNION ALL
                
                SELECT 'Saber' as categoria, sa.verbo_saber as nombre, COUNT(*) as cantidad
                FROM saber sa
                JOIN pdcs_area_trabajo pat ON pat.id = sa.pdc_area_trabajo_id
                JOIN areas_trabajo at ON at.pdc_area_trabajo_id = pat.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND sa.verbo_saber IS NOT NULL
                GROUP BY sa.verbo_saber
                
                UNION ALL
                
                SELECT 'Hacer' as categoria, h.verbo as nombre, COUNT(*) as cantidad
                FROM hacer h
                JOIN pdcs_area_trabajo pat ON pat.id = h.pdc_area_trabajo_id
                JOIN areas_trabajo at ON at.pdc_area_trabajo_id = pat.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND h.verbo IS NOT NULL
                GROUP BY h.verbo
                ORDER BY cantidad DESC
            ) c
        ), '[]'::json),
        'adaptaciones', COALESCE((
            SELECT json_agg(row_to_json(a))
            FROM (
                SELECT 'Básica' as categoria, ab.nombre_adaptacion as nombre, COUNT(*) as cantidad
                FROM adaptaciones_basicas ab
                JOIN planificacion_semanal ps ON ab.planificacion_semanal_id = ps.id
                JOIN areas_trabajo at ON ps.area_trabajo_id = at.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND ab.nombre_adaptacion IS NOT NULL
                GROUP BY ab.nombre_adaptacion
                
                UNION ALL
                
                SELECT 'Especial' as categoria, ae.condicion as nombre, COUNT(*) as cantidad
                FROM evaluacion_adaptaciones_especiales ae
                JOIN pdcs_area_trabajo pat ON pat.id = ae.pdc_area_trabajo_id
                JOIN areas_trabajo at ON at.pdc_area_trabajo_id = pat.id
                WHERE at.unidad_educativa_id = v_unidad_educativa_id AND ae.condicion IS NOT NULL
                GROUP BY ae.condicion
                ORDER BY cantidad DESC
            ) a
        ), '[]'::json)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_director_pdc_metrics TO authenticated;

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key);

async function getPersonalEscuela(unidadId) {
    const { data, error } = await supabase
        .from('areas_trabajo')
        .select(`
            profesor_id,
            perfiles!areas_trabajo_profesor_id_fkey (
                id,
                nombres,
                apellidos,
                email,
                celular,
                foto_url
            )
        `)
        .eq('unidad_educativa_id', unidadId);

    if (error) throw error;

    const personalMap = new Map();
    (data || []).forEach((item) => {
        if (item.perfiles && item.profesor_id && !personalMap.has(item.profesor_id)) {
            personalMap.set(item.profesor_id, {
                id: item.profesor_id,
                rol_institucional: 'Docente',
                perfiles: item.perfiles
            });
        }
    });

    return { data: Array.from(personalMap.values()), error: null, success: true };
}

async function getHorariosGenerales(unidadId) {
    const { data, error } = await supabase
        .from('areas_trabajo')
        .select(`
            id,
            nombre,
            profesor_id,
            perfiles!areas_trabajo_profesor_id_fkey (
                nombres,
                apellidos
            ),
            area_trabajo_paralelo (
                paralelo_id,
                horario
            )
        `)
        .eq('unidad_educativa_id', unidadId);

    if (error) throw error;
    return { data: data || [], error: null, success: true };
}

async function test() {
    const ueId = 81220075;
    try {
        const [persData, horData] = await Promise.all([
            getPersonalEscuela(ueId),
            getHorariosGenerales(ueId)
        ]);
        
        console.log("persData count:", persData.data.length);
        console.log("horData count:", horData.data.length);
        console.log("Teachers found:");
        persData.data.forEach(p => console.log(p.perfiles.nombres));
    } catch (e) {
        console.error("Promise.all failed:", e);
    }
}
test();

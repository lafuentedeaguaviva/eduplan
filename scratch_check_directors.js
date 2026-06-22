require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const directorId = '65e6c7a4-7ab3-4e19-9640-ca13e1179a70';
    
    const { data: unitPdcs, error } = await supabase
        .from('pdcs')
        .select(`
            *,
            docente:perfiles!pdcs_docente_id_fkey (nombres, apellidos, foto_url),
            pdcs_area_trabajo (
                id,
                areas_trabajo (
                    id,
                    unidad_educativa_id,
                    area_conocimiento:areas_conocimiento (nombre)
                )
            )
        `)
        .order('updated_at', { ascending: false });

    console.log("unitPdcs total:", unitPdcs?.length);
    if (unitPdcs && unitPdcs.length > 0) {
        const p = unitPdcs[0];
        console.log("First PDC pdcs_area_trabajo:", JSON.stringify(p.pdcs_area_trabajo, null, 2));
    }
}

check();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addHorario() {
    // Para Comunicación y Lenguaje
    const { data: data1, error: error1 } = await supabase
        .from('area_trabajo_paralelo')
        .update({
            horario: {
                lunes: [{ inicio: "08:00", fin: "09:30" }],
                miercoles: [{ inicio: "10:00", fin: "11:30" }]
            }
        })
        .eq('area_trabajo_id', 'fc5ae149-7bea-43f6-8033-6e7f6b4aa014')
        .eq('paralelo_id', 'fe79b653-829a-49de-95b2-c84c90518ccb')
        .select();
        
    console.log("Com. y Lenguaje:", data1, error1);

    // Para Ciencias Sociales
    const { data: data2, error: error2 } = await supabase
        .from('area_trabajo_paralelo')
        .update({
            horario: {
                martes: [{ inicio: "08:00", fin: "09:30" }],
                jueves: [{ inicio: "10:00", fin: "11:30" }]
            }
        })
        .eq('area_trabajo_id', 'e4f3ef3d-b763-4316-85e7-ef1c6ec6b184')
        .eq('paralelo_id', 'fe79b653-829a-49de-95b2-c84c90518ccb')
        .select();

    console.log("Ciencias Sociales:", data2, error2);
}
addHorario();

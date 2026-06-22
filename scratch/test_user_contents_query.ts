import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function main() {
    const areaIds = ['some-id']; // just to format the query
    let queryBuilder = supabase
            .from('contenidos_usuario')
            .select(`
                id,
                titulo,
                trimestre,
                padre_id,
                orden,
                area_trabajo_id,
                area_trabajo:areas_trabajo(
                    id,
                    profesor_id,
                    area_conocimiento:areas_conocimiento(
                        id,
                        nombre,
                        grado:grados(
                            id,
                            nombre,
                            nivel:niveles(id, nombre)
                        )
                    )
                )
            `)
            .limit(1);

    const { data, error } = await queryBuilder;
    console.log("DATA:", JSON.stringify(data, null, 2));
    if (error) {
        console.error("ERROR:", JSON.stringify(error, null, 2));
    }
}
main();

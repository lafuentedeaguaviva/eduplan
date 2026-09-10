import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const unidadId = searchParams.get('unidadId');

    if (!unidadId) {
        return NextResponse.json({ error: 'unidadId es requerido' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
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
            .eq('unidad_educativa_id', parseInt(unidadId));

        if (error) throw error;

        const personalMap = new Map();
        (data || []).forEach((item: any) => {
            if (item.perfiles && item.profesor_id && !personalMap.has(item.profesor_id)) {
                personalMap.set(item.profesor_id, {
                    id: item.profesor_id,
                    rol_institucional: 'Docente',
                    perfiles: item.perfiles
                });
            }
        });

        return NextResponse.json({ data: Array.from(personalMap.values()), success: true });
    } catch (error: any) {
        console.error('API /director/personal error:', error);
        return NextResponse.json({ error: error?.message || 'Error', success: false }, { status: 500 });
    }
}

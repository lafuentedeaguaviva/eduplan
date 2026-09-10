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
                id,
                nombre,
                profesor_id,
                perfiles!areas_trabajo_profesor_id_fkey (
                    nombres,
                    apellidos
                ),
                area_trabajo_paralelo (
                    paralelo_id,
                    horario,
                    paralelo:paralelos(nombre)
                )
            `)
            .eq('unidad_educativa_id', parseInt(unidadId));

        if (error) throw error;
        
        return NextResponse.json({ data: data || [], success: true });
    } catch (error: any) {
        console.error('API /director/horarios error:', error);
        return NextResponse.json({ error: error?.message || 'Error', success: false }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const perfilId = searchParams.get('perfilId');

    if (!perfilId) {
        return NextResponse.json({ error: 'perfilId es requerido' }, { status: 400 });
    }

    try {
        // 1. Verificar en unidades_educativas
        const { data: ueData } = await supabaseAdmin
            .from('unidades_educativas')
            .select('id')
            .eq('director_id', perfilId)
            .single();

        if (ueData) {
            return NextResponse.json({ data: ueData.id, success: true });
        }

        // 2. Verificar en gestion_directores
        const { data: dirData } = await supabaseAdmin
            .from('gestion_directores')
            .select('unidad_id')
            .eq('perfil_id', perfilId)
            .limit(1)
            .single();

        if (dirData) {
            return NextResponse.json({ data: dirData.unidad_id, success: true });
        }

        // 3. Verificar en unidad_educativa_personal
        const { data: staffData } = await supabaseAdmin
            .from('unidad_educativa_personal')
            .select('unidad_educativa_id')
            .eq('perfil_id', perfilId)
            .single();

        if (staffData) {
            return NextResponse.json({ data: staffData.unidad_educativa_id, success: true });
        }

        // 4. Verificar en areas_trabajo
        const { data: areaData } = await supabaseAdmin
            .from('areas_trabajo')
            .select('unidad_educativa_id')
            .eq('profesor_id', perfilId)
            .limit(1)
            .single();

        if (areaData) {
            return NextResponse.json({ data: areaData.unidad_educativa_id, success: true });
        }

        return NextResponse.json({ data: null, success: true });
    } catch (error: any) {
        console.error('API /director/unidad error:', error);
        return NextResponse.json({ error: error?.message || 'Error', success: false }, { status: 500 });
    }
}

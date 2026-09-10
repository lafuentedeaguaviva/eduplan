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
            .from('recursos_institucionales')
            .select('*')
            .eq('unidad_educativa_id', unidadId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        return NextResponse.json({ data: data || [], success: true });
    } catch (error: any) {
        console.error('API /director/recursos GET error:', error);
        return NextResponse.json({ error: error?.message || 'Error', success: false }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        let result;
        if (id) {
            // Update
            result = await supabaseAdmin
                .from('recursos_institucionales')
                .update({
                    ...data,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();
        } else {
            // Insert
            result = await supabaseAdmin
                .from('recursos_institucionales')
                .insert([data])
                .select()
                .single();
        }

        if (result.error) throw result.error;
        
        return NextResponse.json({ data: result.data, success: true });
    } catch (error: any) {
        console.error('API /director/recursos error:', error);
        return NextResponse.json({ error: error?.message || 'Error', success: false }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'id es requerido' }, { status: 400 });
    }

    try {
        const { error } = await supabaseAdmin
            .from('recursos_institucionales')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API /director/recursos error:', error);
        return NextResponse.json({ error: error?.message || 'Error', success: false }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the Service Role key to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { revisionId, directorId, estado, observaciones } = body;

        if (!revisionId || !directorId || !estado) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('pdc_revisiones')
            .update({
                estado,
                pdc_estado: estado === 'observado' ? 'Observado' : 
                           estado === 'aprobado' ? 'Aprobado' : 
                           estado === 'revisado' ? 'Revisado' : 'Verificado',
                director_id: directorId,
                observaciones: observaciones || null
            })
            .eq('id', revisionId)
            .select()
            .single();

        if (error) {
            console.error('Error updating revision (Admin API):', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (data && data.pdc_origen_id) {
            const nuevoEstadoPdc = estado === 'aprobado' ? 'Aprobado' : 
                                   estado === 'observado' ? 'Observado' : 
                                   estado === 'revisado' ? 'Revisado' : undefined;
            
            if (nuevoEstadoPdc) {
                await supabaseAdmin
                    .from('pdcs')
                    .update({ estado: nuevoEstadoPdc })
                    .eq('id', data.pdc_origen_id);
            }
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('API /pdc/review error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

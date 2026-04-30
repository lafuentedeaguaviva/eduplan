import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        
        // Ensure user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { 
            nombre_pdc, 
            gestion, 
            trimestre, 
            mes, 
            fecha_inicio, 
            fecha_fin,
            objetivo_holistico,
            pdc_area_trabajo_id 
        } = body;

        // 1. Update main PDC
        const { error: pdcError } = await supabase
            .from('pdcs')
            .update({
                nombre_pdc,
                gestion,
                trimestre,
                mes,
                fecha_inicio: fecha_inicio || null,
                fecha_fin: fecha_fin || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('docente_id', user.id); // Security: only update if owned by user (or via Admin RLS if applicable)

        if (pdcError) {
            console.error('API Error updating PDC:', pdcError);
            return NextResponse.json({ error: 'Error actualizando PDC principal' }, { status: 500 });
        }

        // 2. Update or Insert Objetivo Holístico if we have the area link
        if (pdc_area_trabajo_id) {
            // First check if an objective already exists for this pdc_area_trabajo
            const { data: existingObj } = await supabase
                .from('objetivo_estrategico')
                .select('id')
                .eq('pdc_area_trabajo_id', pdc_area_trabajo_id)
                .single();

            if (existingObj) {
                // Update
                const { error: objError } = await supabase
                    .from('objetivo_estrategico')
                    .update({ descripcion: objetivo_holistico, updated_at: new Date().toISOString() })
                    .eq('id', existingObj.id);
                
                if (objError) console.error("Error updating objetivo:", objError);
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('objetivo_estrategico')
                    .insert({
                        pdc_area_trabajo_id,
                        descripcion: objetivo_holistico
                    });
                
                if (insertError) console.error("Error inserting objetivo:", insertError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Unexpected API Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

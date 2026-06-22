import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    // Buscar la revisión por ID o por pdc_origen_id
    const { data: revision, error } = await supabase
        .from('pdc_revisiones')
        .select('*')
        .or(`id.eq.${id},pdc_origen_id.eq.${id}`)
        .maybeSingle();

    return NextResponse.json({
        searched_id: id,
        authenticated_user: user?.id,
        found_revision: revision ? {
            id: revision.id,
            pdc_origen_id: revision.pdc_origen_id,
            profesor_id: revision.profesor_id,
            estado: revision.estado,
            has_snapshot: !!revision.pdc_snapshot,
            snapshot_keys: revision.pdc_snapshot ? Object.keys(revision.pdc_snapshot) : []
        } : null,
        error: error?.message
    });
}

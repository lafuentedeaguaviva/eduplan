import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DirectorStatsService } from '@/services/director-stats.service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const directorId = searchParams.get('directorId');

        if (!directorId) {
            return NextResponse.json({ error: 'Director ID is required', success: false }, { status: 400 });
        }

        // Bypass RLS para generar las métricas consolidadas del director
        const res = await DirectorStatsService.getPedagogicalStats(directorId, supabaseAdmin);
        
        return NextResponse.json(res);
    } catch (error: any) {
        console.error('API /api/director/stats Error:', error);
        return NextResponse.json({ error: error.message, success: false }, { status: 500 });
    }
}

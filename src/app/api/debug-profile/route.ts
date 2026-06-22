import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 1. Perfil
    const { data: profile } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

    // 2. Roles
    const { data: roles } = await supabase
        .from('perfil_roles')
        .select('rol_nombre')
        .eq('perfil_id', user.id);

    return NextResponse.json({
        user_id: user.id,
        email: user.email,
        profile_exists: !!profile,
        profile_data: profile,
        detected_roles: roles?.map(r => r.rol_nombre) || []
    });
}

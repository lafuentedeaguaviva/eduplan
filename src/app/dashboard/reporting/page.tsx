import { createClient } from '@/utils/supabase/server';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function ReportingPage() {
    const supabase = await createClient();
    
    // Server-side auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        redirect('/login');
    }

    // Server-side data fetching
    const { count: pdccount } = await supabase.from('pdcs').select('*', { count: 'exact', head: true });
    const { count: profilecount } = await supabase.from('perfiles').select('*', { count: 'exact', head: true });
    const { count: uecount } = await supabase.from('unidades_educativas').select('*', { count: 'exact', head: true });

    const stats = {
        totalPdcs: pdccount || 0,
        totalProfiles: profilecount || 0,
        totalUE: uecount || 0,
    };

    const { data: pdcs } = await supabase.from('pdcs').select(`
        id,
        nombre_pdc,
        gestion,
        trimestre,
        estado,
        perfiles!pdcs_docente_id_fkey (nombres, apellidos)
    `).limit(10);

    return <DashboardClient initialStats={stats} initialPdcs={pdcs || []} userEmail={user.email} />;
}

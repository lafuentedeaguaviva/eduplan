import { redirect } from 'next/navigation';
import PdcEditorClient from './PdcEditorClient';
import { PdcService } from '@/services/pdc.service';
import { getDb } from '@/lib/supabaseWrapper';
import { Pdc } from '@/types';

import { createClient } from '@/utils/supabase/server';

/**
 * Página de Detalle de PDC (Server Component)
 * 
 * ROL EN MVC: Actúa como el "Controlador" de entrada.
 * PROPÓSITO: Orquestar el flujo de datos. Verifica acceso y delega la lógica pesada al Servicio.
 * Regla: Separation of Concerns - La página está "limpia" de bucles y lógica compleja.
 */
export default async function PdcDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Obtiene los parámetros de la URL de forma asíncrona (Next.js App Router)
    const { id } = await params;
    console.log("Rendering PdcDetailPage for ID:", id);

    // Redirección temprana si no hay ID
    if (!id) redirect('/reporting');

    // Y necesitamos el cliente RAW de Supabase con cookies para la generación del reporte
    const rawSupabase = await createClient();

    // 2. Control de Acceso: Verifica que el usuario esté autenticado usando el cliente del servidor
    const { data: { user }, error: authError } = await rawSupabase.auth.getUser();
    if (authError || !user) {
        console.warn("[PdcDetailPage] Usuario no autenticado o error de sesión:", authError?.message);
        redirect('/login');
    }

    // 3. Obtención de Datos: Delega al PdcService la tarea de agregar y formatear todo el reporte
    // Pasamos explícitamente el cliente autenticado del servidor
    const fullReportData = await PdcService.getFullReportData(id, 'original', false, rawSupabase);

    // Manejo de estado de error si el PDC no existe o falla la carga
    if (!fullReportData) {
        return (
            <div className="p-8 text-white min-h-screen bg-[#0f172a] flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-red-500">Error cargando el PDC</h1>
                <p className="text-slate-400">No se pudo encontrar el documento o la revisión solicitada.</p>
                <code className="bg-slate-800 px-4 py-2 rounded text-xs text-indigo-300">ID: {id}</code>
                <a href="/dashboard/pdcs" className="text-sm text-blue-400 hover:underline pt-4">Volver a mis PDCs</a>
            </div>
        );
    }

    // 4. Obtención de datos mínimos del PDC para el estado inicial del cliente
    const { data: initialPdcRaw } = await rawSupabase.from('pdcs').select('*').eq('id', id).maybeSingle();
    let pdc = initialPdcRaw;

    // Si no existe el PDC maestro (ej: fue eliminado pero queda la revisión), 
    // construimos un objeto mínimo desde los metadatos del reporte para que el cliente no rompa.
    if (!pdc && fullReportData) {
        pdc = {
            id: id,
            nombre_pdc: (fullReportData as any).materia || fullReportData.areas || 'Reporte Guardado',
            gestion: fullReportData.gestion,
            trimestre: fullReportData.trimestre,
            docente_id: user.id,
            estado: 'Terminado'
        } as any;
    }

    // 5. Renderizado: Pasa los datos procesados al componente de "Vista" (Client Component)
    return (
        <PdcEditorClient
            pdcId={id}
            initialPdc={pdc as any}
            fullReportData={fullReportData}
        />
    );
}

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

    // Redirección temprana si no hay ID
    if (!id) redirect('/reporting');

    // Inicializa el acceso a la Base de Datos a través del Wrapper agnóstico
    const db = await getDb();
    
    // Y necesitamos el cliente RAW de Supabase con cookies para la generación del reporte
    const rawSupabase = await createClient();

    // 2. Control de Acceso: Verifica que el usuario esté autenticado
    const { data: { user } } = await db.auth();
    if (!user) {
        redirect('/login');
    }

    // 3. Obtención de Datos: Delega al PdcService la tarea de agregar y formatear todo el reporte
    // Esto encapsula toda la complejidad de los joins y la jerarquía de contenidos.
    const fullReportData = await PdcService.getFullReportData(id, rawSupabase);

    // Manejo de estado de error si el PDC no existe o falla la carga
    if (!fullReportData) {
        return <div className="p-8 text-white min-h-screen bg-[#0f172a]">Error cargando PDC o PDC no encontrado.</div>;
    }

    // 4. Obtención de datos mínimos del PDC para el estado inicial del cliente
    const pdc = await db.fetchSingle<Pdc>('pdcs', '*', { id });

    // 5. Renderizado: Pasa los datos procesados al componente de "Vista" (Client Component)
    return (
        <PdcEditorClient
            pdcId={id}
            initialPdc={pdc}
            fullReportData={fullReportData}
        />
    );
}

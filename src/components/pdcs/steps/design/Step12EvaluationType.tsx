'use client';

import React, { useEffect, useState } from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { PdcService } from '@/services/pdc.service';
import PdcEditorClient from '@/components/pdcs/viewer/PdcEditorClient';

export function Step12FinalPreview() {
    const { currentPdcId } = usePdcWizard();
    const [reportData, setReportData] = useState<any>(null);
    const [initialPdc, setInitialPdc] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadReport() {
            if (!currentPdcId) return;
            try {
                const { db } = await import('@/lib/database');
                
                // Fetch full report data (Forcing live to get IA updates)
                const fullData = await PdcService.getFullReportData(currentPdcId, 'original', true);
                
                // Fetch basic pdc data
                const { data: pdc } = await db.from('pdcs').select('*').eq('id', currentPdcId).single();

                setReportData(fullData);
                setInitialPdc(pdc);
            } catch (error) {
                console.error("Error loading report in step 12:", error);
            } finally {
                setLoading(false);
            }
        }

        loadReport();
    }, [currentPdcId]);

    if (!currentPdcId) return <div>No hay PDC actual.</div>;
    
    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p className="text-slate-500 font-medium animate-pulse">Generando formulario final...</p>
            </div>
        );
    }

    if (!reportData || !initialPdc) {
        return <div className="p-8 text-center text-red-500">Error al cargar el reporte.</div>;
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 -mt-8">
            <PdcEditorClient 
                pdcId={currentPdcId} 
                initialPdc={initialPdc} 
                fullReportData={reportData} 
            />
        </div>
    );
}

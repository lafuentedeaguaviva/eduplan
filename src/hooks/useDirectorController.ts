'use client';

import { useState, useEffect, useCallback } from 'react';
import { PdcService } from '@/services/pdc.service';
import { useProfile } from '@/contexts/ProfileContext';
import { PdcRevisionesService } from '@/services/pdc-revisiones.service';
import { differenceInHours } from 'date-fns';

export function useDirectorController() {
    const { profile } = useProfile();
    const [analytics, setAnalytics] = useState<any>(null);
    const [staff, setStaff] = useState<any[]>([]);
    const [pdcs, setPdcs] = useState<any[]>([]);
    const [revisionStats, setRevisionStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!profile?.id) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const [analyticsRes, staffRes, pdcsRes, revisions] = await Promise.all([
                PdcService.getUEAnalytics(profile.id),
                PdcService.getStaffPerformance(profile.id),
                PdcService.getPDCsForDirector(profile.id),
                PdcRevisionesService.getDirectorInbox()
            ]);

            if (analyticsRes.success) setAnalytics(analyticsRes.data);
            if (staffRes.success) setStaff(staffRes.data ?? []);
            if (pdcsRes.success) setPdcs(pdcsRes.data ?? []);

            // Calcular Estadísticas de Revisión
            const total = revisions.length;
            const aprobados = revisions.filter(r => r.estado === 'aprobado').length;
            const cycleTimes = revisions
                .filter(r => r.estado === 'aprobado')
                .map(r => differenceInHours(new Date(r.updated_at), new Date(r.created_at)));
            
            setRevisionStats({
                total,
                aprobados,
                enviados: revisions.filter(r => r.estado === 'enviado').length,
                observados: revisions.filter(r => r.estado === 'observado').length,
                approvalRate: total > 0 ? Math.round((aprobados / total) * 100) : 0,
                avgCycleTime: cycleTimes.length > 0 ? (cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length).toFixed(1) : '—'
            });

        } catch (err) {
            console.error('Error loading director dashboard data:', err);
            setError('Error al cargar la información institucional.');
        } finally {
            setLoading(false);
        }
    }, [profile?.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const refresh = () => loadData();

    return {
        analytics,
        staff,
        pdcs,
        revisionStats,
        loading,
        error,
        refresh
    };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface StatItem {
    categoria: string;
    nombre: string;
    cantidad: number;
}

export interface DetailedStats {
    momentos: StatItem[];
    criterios: StatItem[];
    adaptaciones: StatItem[];
}

export function usePdcDetailedStats() {
    const [stats, setStats] = useState<DetailedStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: rpcError } = await supabase.rpc('get_director_pdc_metrics');
            
            if (rpcError) throw rpcError;
            
            if (data && !data.error) {
                setStats(data as DetailedStats);
            } else if (data?.error) {
                console.warn(data.error);
                setError(data.error);
            }
        } catch (err: any) {
            console.error('Error loading detailed stats:', err);
            setError(err.message || 'Error al cargar estadísticas detalladas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    return {
        stats,
        loading,
        error,
        refresh: loadStats
    };
}

'use client';

import { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { SubscriptionService } from '@/services/subscription.service';

/**
 * Hook para gestionar el acceso basado en la suscripción del usuario.
 */
export function useSubscription() {
    const { profile, loading } = useProfile();

    const isPremium = profile?.suscripcion?.plan_nombre.toLowerCase().includes('premium') || 
                      profile?.suscripcion?.plan_nombre.toLowerCase().includes('institucional');
    
    const isFree = !profile?.suscripcion || profile?.suscripcion?.plan_nombre === 'Gratuito';
    
    const isActive = profile?.suscripcion?.estado === 'activo' || profile?.suscripcion?.estado === 'trial';
    
    const planName = profile?.suscripcion?.plan_nombre || 'Gratuito';
    const currentCredits = profile?.creditos || 0;
    const [costs, setCosts] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchCosts = async () => {
            const { data } = await SubscriptionService.getServiceCosts();
            if (data) setCosts(data);
        };
        fetchCosts();
    }, []);

    /**
     * Verifica si el usuario tiene créditos suficientes para una acción.
     */
    const canPerformAction = (actionName: string): boolean => {
        const cost = costs[actionName] || 0;
        return currentCredits >= cost;
    };

    /**
     * Obtiene el costo en créditos de una acción específica.
     */
    const getActionCost = (actionName: string): number => {
        return costs[actionName] || 0;
    };

    return {
        isPremium,
        isFree,
        isActive,
        planName,
        currentCredits,
        canPerformAction,
        getActionCost,
        subscription: profile?.suscripcion,
        loading
    };
}

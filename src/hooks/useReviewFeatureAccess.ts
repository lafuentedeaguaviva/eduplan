import { useProfile } from '@/contexts/ProfileContext';

export function useReviewFeatureAccess() {
    const { profile, loading } = useProfile();

    if (loading || !profile) return { hasAccess: false, loading };

    // 1. Directores y Administradores siempre tienen acceso a su vista
    const isDirector = profile.roles?.includes('Director') || profile.roles?.includes('Administrador');
    
    // 2. Maestros: Lógica Ciega de acceso
    // Requiere suscripción activa (plan_id > 1) y (futuro: escuela completa)
    // Asumimos que profile.suscripcion existe y plan_id > 1 es Pro o Institucional
    const hasProSubscription = profile.suscripcion && profile.suscripcion.plan_id > 1;

    // Si tuviéramos los flags en la BD (isEscuelaCompleta, isPreHabilitado) se añadirían aquí.
    
    const hasAccess = isDirector || hasProSubscription;

    return { hasAccess, loading, isDirector };
}

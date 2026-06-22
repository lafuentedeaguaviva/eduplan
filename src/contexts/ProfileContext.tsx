'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProfileService, UserProfile } from '@/services/profile.service';
import { AuthService } from '@/services/auth.service';

interface ProfileContextType {
    profile: UserProfile | null;
    activeRole: string | null;
    setActiveRole: (role: string | null) => void;
    loading: boolean;
    refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [activeRole, setActiveRoleState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Persistencia del rol activo
    const setActiveRole = (role: string | null) => {
        setActiveRoleState(role);
        if (role) {
            localStorage.setItem('eduplan_active_role', role);
        } else {
            localStorage.removeItem('eduplan_active_role');
        }
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await AuthService.getSession();
            if (session?.user) {
                const res = await ProfileService.getProfile(session.user.id);
                
                // Extraer metadata de Google para fallback manual
                const metadata = session.user.user_metadata;
                const googleName = metadata?.full_name || '';
                const googleAvatar = metadata?.avatar_url || '';

                if (res.success && res.data) {
                    const profileData = {
                        ...res.data,
                        foto_url: res.data.foto_url || googleAvatar,
                        nombres: res.data.nombres || googleName.split(' ')[0] || '',
                        apellidos: res.data.apellidos || googleName.split(' ').slice(1).join(' ') || '',
                    };
                    setProfile(profileData);

                    // Lógica de Rol Activo:
                    // 1. Intentar recuperar de localStorage
                    const savedRole = localStorage.getItem('eduplan_active_role');
                    const roles = profileData.roles || [];
                    
                    if (savedRole && roles.includes(savedRole)) {
                        setActiveRoleState(savedRole);
                    } else if (roles.length === 1) {
                        // Si solo hay uno, ese es el activo
                        setActiveRoleState(roles[0]);
                    } else {
                        // Si hay varios y no hay guardado, forzamos selección (selector mostrará null)
                        setActiveRoleState(null);
                    }
                } else {
                    // Fallback inicial con datos de Google
                    const fallbackProfile = {
                        id: session.user.id,
                        email: session.user.email || '',
                        nombres: googleName.split(' ')[0] || '',
                        apellidos: googleName.split(' ').slice(1).join(' ') || '',
                        foto_url: googleAvatar,
                        creditos: 0,
                        solicitudes_ia_hoy: 0,
                        ultima_solicitud_ia: new Date().toISOString().split('T')[0],
                        roles: ['Profesor'],
                    } as UserProfile;
                    setProfile(fallbackProfile);
                    setActiveRoleState('Profesor');
                }
            }
        } catch (error) {
            console.error('Error fetching profile in context:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ 
            profile, 
            activeRole, 
            setActiveRole, 
            loading, 
            refetchProfile: fetchProfile 
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}


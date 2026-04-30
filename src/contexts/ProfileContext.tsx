'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProfileService, UserProfile } from '@/services/profile.service';
import { AuthService } from '@/services/auth.service';

interface ProfileContextType {
    profile: UserProfile | null;
    loading: boolean;
    refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
                    // Si el perfil existe, nos aseguramos de no perder el avatar de Google si no hay uno local
                    setProfile({
                        ...res.data,
                        foto_url: res.data.foto_url || googleAvatar,
                        nombres: res.data.nombres || googleName.split(' ')[0] || '',
                        apellidos: res.data.apellidos || googleName.split(' ').slice(1).join(' ') || '',
                    });
                } else {
                    // Fallback inicial con datos de Google
                    setProfile({
                        id: session.user.id,
                        email: session.user.email || '',
                        nombres: googleName.split(' ')[0] || '',
                        apellidos: googleName.split(' ').slice(1).join(' ') || '',
                        foto_url: googleAvatar,
                        creditos: 0,
                        solicitudes_ia_hoy: 0,
                        ultima_solicitud_ia: new Date().toISOString().split('T')[0],
                        roles: ['Profesor'],
                    } as UserProfile);
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
        <ProfileContext.Provider value={{ profile, loading, refetchProfile: fetchProfile }}>
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


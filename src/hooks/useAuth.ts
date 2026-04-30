'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/database';
import type { User } from '@supabase/supabase-js';

interface UseAuthResult {
    user: User | null;
    loading: boolean;
}

/**
 * Lightweight wrapper around Supabase's auth state for client components.
 * Exposes the current authenticated user and a loading flag.
 * Reacts to auth state changes (login/logout) automatically.
 */
export function useAuth(): UseAuthResult {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Retrieve the initial session
        db.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Subscribe to future auth state changes
        const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}

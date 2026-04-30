import { db } from '@/lib/database';
import { ServiceResponse } from '@/types';

/**
 * Model: AuthService
 * 
 * Gestiona la autenticación y el manejo de perfiles de usuario.
 * Actúa como una interfaz limpia sobre Supabase Auth.
 */
export const AuthService = {
    /**
     * Registra un nuevo profesor en el sistema.
     */
    async signUp(email: string, password: string, nombres: string, apellidos: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    nombres,
                    apellidos,
                    full_name: `${nombres} ${apellidos}`,
                },
            },
        });
        return { data, error, success: !error };
    },

    /**
     * Inicia sesión con credenciales tradicionales.
     */
    async signIn(email: string, password: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error, success: !error };
    },

    /**
     * Inicia sesión con Google OAuth.
     * @param {string} redirectTo - URL a la que redirigir tras el éxito.
     */
    async signInWithGoogle(redirectTo: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
                scopes: 'openid profile email'
            }
        });
        return { data, error, success: !error };
    },

    /**
     * Cierra la sesión activa del usuario.
     */
    async signOut(): Promise<ServiceResponse<any>> {
        const { error } = await db.auth.signOut();
        return { data: null, error, success: !error };
    },

    /**
     * Obtiene la sesión actual desde el cliente de Supabase.
     */
    async getSession(): Promise<ServiceResponse<any>> {
        const { data, error } = await db.auth.getSession();
        return { data, error, success: !error };
    },

    /**
     * Recupera el perfil extendido del profesor desde la tabla 'perfiles'.
     */
    async getProfile(userId: string): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('perfiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error, success: !error };
    },

    /**
     * Crea un perfil inicial para un usuario nuevo.
     */
    async createProfile(profileData: any): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('perfiles')
            .upsert(profileData);
        return { data, error, success: !error };
    },

    /**
     * Actualiza el perfil de un usuario.
     */
    async updateProfile(userId: string, updates: any): Promise<ServiceResponse<any>> {
        const { data, error } = await db
            .from('perfiles')
            .update(updates)
            .eq('id', userId);
        return { data, error, success: !error };
    },


    /**
     * Obtiene los roles asignados a un usuario.
     */
    async getUserRoles(userId: string): Promise<ServiceResponse<string[]>> {
        const { data, error } = await db
            .from('perfil_roles')
            .select('rol_nombre')
            .eq('perfil_id', userId);
        
        const roles = data ? data.map((r: any) => r.rol_nombre) : [];
        return { data: roles, error, success: !error };
    },
};

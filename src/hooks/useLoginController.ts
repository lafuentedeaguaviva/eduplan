import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useFeedback } from './useFeedback';

/**
 * Controller: useLoginController
 * 
 * Gestiona la lógica de negocio para la página de inicio de sesión.
 */
export function useLoginController() {
    const router = useRouter();
    const { feedback, showError, hideFeedback } = useFeedback();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            showError('Campos Requeridos', 'Por favor complete todos los campos.');
            return;
        }

        setLoading(true);
        hideFeedback();

        try {
            const result = await AuthService.signIn(formData.email, formData.password);

            if (result.success && result.data?.user) {
                // Si llegamos aquí, la sesión está activa y sincronizada
                const resProfile = await AuthService.getProfile(result.data.user.id);

                if (!resProfile.success || !resProfile.data) {
                    router.push('/auth/complete-profile');
                } else {
                    router.push('/dashboard');
                }
            } else {
                const isEmailNotConfirmed = result.error?.message?.toLowerCase().includes('email not confirmed');
                showError(
                    'Error de Acceso', 
                    isEmailNotConfirmed 
                        ? 'Tu correo electrónico aún no ha sido verificado. Por favor, revisa tu bandeja de entrada o desactiva la confirmación en Supabase.'
                        : (result.error?.message || 'Email o contraseña incorrectos.')
                );
            }

        } catch (error) {
            showError('Error de Sistema', 'No se pudo conectar con el servidor de autenticación.');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        feedback,
        handleInputChange,
        handleLogin,
        hideFeedback
    };
}

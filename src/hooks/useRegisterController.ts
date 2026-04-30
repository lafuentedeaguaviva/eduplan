import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useFeedback } from './useFeedback';

/**
 * Controller: useRegisterController
 * 
 * Gestiona la lógica de negocio para la página de registro.
 */
export function useRegisterController() {
    const router = useRouter();
    const { feedback, showError, showSuccess, hideFeedback } = useFeedback();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.email || !formData.password) {
            showError('Datos Incompletos', 'Por favor complete todos los campos obligatorios.');
            return;
        }

        setLoading(true);
        hideFeedback();

        try {
            const result = await AuthService.signUp(
                formData.email,
                formData.password,
                formData.nombre,
                formData.apellido
            );

            if (result.success) {
                showSuccess('Cuenta Creada', 'Te hemos enviado un correo de confirmación. Por favor verifica tu bandeja de entrada.');
            } else {
                showError('Error de Registro', result.error?.message || 'No se pudo crear la cuenta.');
            }
        } catch (error) {
            showError('Error de Sistema', 'Ocurrió un error inesperado durante el registro.');
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        loading,
        feedback,
        handleInputChange,
        handleRegister,
        hideFeedback
    };
}

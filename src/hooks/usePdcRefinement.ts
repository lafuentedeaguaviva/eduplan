import { useState } from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { AiOptimizationService } from '../services/aiOptimization.service';
import { TonoRedaccion } from '../lib/ai/promptTemplates';
import { db } from '@/lib/database';
import { PdcService } from '@/services/pdc.service';

/**
 * Hook para gestionar el proceso de refinamiento IA batch en el Paso 11.
 */
export function usePdcRefinement() {
    const { 
        currentPdcId, 
        showSuccess, 
        showError,
        selectedTone, 
        setSelectedTone, 
        correctionDepth, 
        setCorrectionDepth 
    } = usePdcWizard();
    const [isRefining, setIsRefining] = useState(false);
    const [progress, setProgress] = useState<string[]>([]);
    const [progressValue, setProgressValue] = useState(0);

    const startRefinement = async () => {
        if (!currentPdcId) {
            showError('No se ha encontrado el ID del PDC actual.');
            return;
        }

        setIsRefining(true);
        setProgress(['Iniciando proceso de optimización...']);
        setProgressValue(5);

        try {
            // 1. Guardar preferencias en el PDC Maestro
            await PdcService.updatePdcMaster(currentPdcId, {
                escritura_tipo_ia: selectedTone,
                correccion_profundidad_ia: correctionDepth
            });
            setProgress(prev => [...prev, '✅ Preferencias de IA guardadas.']);
            setProgressValue(10);

            // 2. Obtener sesión y perfil para verificar credenciales
            const { data: { session } } = await db.auth.getSession();
            const userId = session?.user?.id;
            const providerToken = session?.provider_token;

            if (!userId) {
                throw new Error('No se pudo identificar al usuario. Por favor inicia sesión.');
            }

            setProgress(prev => [...prev, '🧹 Borrando datos generados anteriormente...']);
            await AiOptimizationService.clearAiFields(currentPdcId);
            setProgressValue(15);

            // 3. Ya no validamos el token localmente, la API se encarga
            setProgress(prev => [...prev, 'ℹ️ Iniciando servicios de IA (Modelo Centralizado)...']);
            setProgressValue(20);

            // 4. Ejecutar servicio batch
            await AiOptimizationService.refineFullPdc(
                currentPdcId,
                selectedTone,
                correctionDepth,
                userId,
                providerToken || '',
                (msg, stepProgress) => {
                    setProgress(prev => [...prev, msg]);
                    if (stepProgress) {
                        setProgressValue(prev => Math.min(98, prev + stepProgress));
                    }
                }
            );

            setProgressValue(100);
            setProgress(prev => [...prev, '✅ ¡Optimización finalizada con éxito!']);
            showSuccess('El PDC ha sido optimizado y está listo para descargar.');
        } catch (error: any) {
            console.error('Refinement process failed:', error);
            setProgress(prev => [...prev, `❌ Error: ${error.message || 'Error desconocido'}`]);
            showError(`Error en el refinamiento: ${error.message}`);
        } finally {
            setIsRefining(false);
        }
    };

    return {
        isRefining,
        progress,
        progressValue,
        selectedTone,
        setSelectedTone,
        correctionDepth,
        setCorrectionDepth,
        startRefinement
    };
}

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePdcWizardController } from '@/hooks/usePdcWizardController';
import { AlertDialog } from '@/components/ui/AlertDialog';

/**
 * Controller: PdcWizardContext
 * 
 * Centraliza el estado y las acciones del Wizard de creación de PDC.
 * Implementa el patrón MVC proveyendo el "Controlador" a todas las "Vistas" (pasos).
 */

type PdcWizardContextType = ReturnType<typeof usePdcWizardController>;

const PdcWizardContext = createContext<PdcWizardContextType | undefined>(undefined);

export function PdcWizardProvider({ children }: { children: ReactNode }) {
    const controller = usePdcWizardController();

    return (
        <PdcWizardContext.Provider value={controller}>
            {children}
            
            {/* Sistema de Diálogos Global del Wizard */}
            <AlertDialog
                isOpen={controller.feedback.isOpen}
                title={controller.feedback.title}
                description={controller.feedback.description}
                confirmText={controller.feedback.isConfirm ? controller.feedback.confirmText : 'Entendido'}
                cancelText={controller.feedback.isConfirm ? controller.feedback.cancelText : 'Ocultar'}
                variant={controller.feedback.type === 'error' ? 'danger' : controller.feedback.type === 'success' ? 'success' : 'warning'}
                onConfirm={() => {
                    if (controller.feedback.isConfirm) {
                        controller.feedback.onConfirm?.();
                    }
                    controller.hideFeedback();
                }}
                onClose={() => {
                    if (controller.feedback.isConfirm) {
                        controller.feedback.onCancel?.();
                    }
                    controller.hideFeedback();
                }}
            />
        </PdcWizardContext.Provider>
    );
}

export function usePdcWizard() {
    const context = useContext(PdcWizardContext);
    if (context === undefined) {
        throw new Error('usePdcWizard must be used within a PdcWizardProvider');
    }
    return context;
}


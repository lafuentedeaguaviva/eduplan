import { useState, useCallback } from 'react';

export type FeedbackType = 'error' | 'success' | 'info' | 'warning';

export interface FeedbackState {
    type: FeedbackType;
    title: string;
    description: string;
    isOpen: boolean;
    isConfirm?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function useFeedback() {
    const [feedback, setFeedback] = useState<FeedbackState>({
        type: 'info',
        title: '',
        description: '',
        isOpen: false,
        isConfirm: false
    });

    const showConfirm = useCallback(({ 
        title, 
        description, 
        onConfirm, 
        onCancel,
        confirmText,
        cancelText,
        variant = 'warning'
    }: { 
        title: string, 
        description: string, 
        onConfirm: () => void, 
        onCancel?: () => void,
        confirmText?: string,
        cancelText?: string,
        variant?: FeedbackType
    }) => {
        setFeedback({
            type: variant,
            title,
            description,
            isOpen: true,
            isConfirm: true,
            onConfirm,
            onCancel,
            confirmText,
            cancelText
        });
    }, []);

    const showError = useCallback((title: string, error?: unknown) => {
        const description = error instanceof Error ? error.message : String(error || '');
        setFeedback({
            type: 'error',
            title,
            description,
            isOpen: true,
            isConfirm: false
        });
    }, []);

    const showSuccess = useCallback((title: string, message?: unknown) => {
        const description = typeof message === 'string' ? message : String(message || '');
        setFeedback({
            type: 'success',
            title,
            description,
            isOpen: true,
            isConfirm: false
        });
    }, []);

    const showInfo = useCallback((title: string, message?: unknown) => {
        const description = typeof message === 'string' ? message : String(message || '');
        setFeedback({
            type: 'info',
            title,
            description,
            isOpen: true,
            isConfirm: false
        });
    }, []);

    const hideFeedback = useCallback(() => {
        setFeedback(prev => ({ ...prev, isOpen: false }));
    }, []);

    return {
        feedback,
        showError,
        showSuccess,
        showInfo,
        showConfirm,
        hideFeedback
    };
}

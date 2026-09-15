import { db } from "../lib/database";

export const MonetizationService = {
    /**
     * Obtiene la configuración de monetización actual.
     */
    async getConfig() {
        const { data, error } = await db.from('config_monetizacion').select('*').single();
        if (error || !data) {
            console.error('Error fetching monetization config:', error);
            // Default fallbacks
            return {
                costo_pdc_secundaria: 10,
                costo_pdc_primaria: 15,
                costo_examen: 5,
                costo_autocompletar: 2,
                bono_registro_inicial: 20
            };
        }
        return data;
    },

    /**
     * Calcula el costo de generar un PDC dependiendo de cuántas áreas tiene.
     */
    async calculatePdcCost(pdcId: string): Promise<number> {
        const config = await this.getConfig();
        
        // Contar cuántas áreas de trabajo tiene este PDC
        const { data: areas, error } = await db
            .from('pdcs_area_trabajo')
            .select('id')
            .eq('pdc_id', pdcId);
            
        if (error || !areas || areas.length === 0) {
            return config.costo_pdc_secundaria; // Por defecto
        }
        
        // Si tiene más de un área, se considera Primaria/Inicial (Integrado)
        if (areas.length > 1) {
            return config.costo_pdc_primaria;
        }
        
        return config.costo_pdc_secundaria;
    },

    /**
     * Valida si el usuario tiene suficientes monedas para una operación.
     * Retorna { valid: boolean, required: number, available: number }
     */
    async checkBalanceForPdc(userId: string, pdcId: string) {
        const requiredCoins = await this.calculatePdcCost(pdcId);
        
        const { data, error } = await db
            .from('perfiles')
            .select('monedas_disponibles')
            .eq('id', userId)
            .single();
            
        if (error || !data) {
            throw new Error('No se pudo verificar el saldo.');
        }
        
        const available = data.monedas_disponibles || 0;
        
        return {
            valid: available >= requiredCoins,
            required: requiredCoins,
            available
        };
    },
    
    /**
     * Valida saldo para una acción genérica.
     */
    async checkBalanceForAction(userId: string, actionCost: number) {
        const { data, error } = await db
            .from('perfiles')
            .select('monedas_disponibles')
            .eq('id', userId)
            .single();
            
        if (error || !data) {
            throw new Error('No se pudo verificar el saldo.');
        }
        
        const available = data.monedas_disponibles || 0;
        
        return {
            valid: available >= actionCost,
            required: actionCost,
            available
        };
    }
};

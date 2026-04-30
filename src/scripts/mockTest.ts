/**
 * PRUEBA DE ESTRÉS AISLADA (MOCK)
 * Validamos la lógica de Reintentos y Failover sin dependencias de DB.
 */

async function _executeWithProvider(endpoint: string, prompt: string, retries: number, backoff: number): Promise<string> {
    console.log(`[Service] Llamando a ${endpoint}...`);
    for (let i = 0; i < retries; i++) {
        try {
            // SIMULACIÓN DE FETCH
            if (endpoint === '/api/gemini') {
                console.log(`  > [Gemini] Intento ${i+1}: Simulando Error 429 (Cuota Agotada)`);
                throw new Error("429: Too Many Requests");
            }
            
            if (endpoint === '/api/deepseek') {
                console.log(`  > [DeepSeek] Intento ${i+1}: Conectando...`);
                return "Respuesta exitosa de DeepSeek tras Failover. ✅";
            }
            
            return "Ok";
        } catch (error: any) {
            if (i < retries - 1) {
                console.log(`  ! Error detectado. Reintentando en ${backoff * (i + 1)}ms...`);
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Máximo de reintentos alcanzado en ${endpoint}`);
}

async function _callProxy(prompt: string, retries = 3, backoff = 100): Promise<string> {
    try {
        console.log("--- PASO 1: Intentando con Proveedor Principal (Gemini) ---");
        return await _executeWithProvider('/api/gemini', prompt, retries, backoff);
    } catch (geminiError: any) {
        console.warn("⚠️ Gemini falló definitivamente. [ACTIVANDO FAILOVER A DEEPSEEK]");
        
        try {
            return await _executeWithProvider('/api/deepseek', prompt, 2, 100);
        } catch (deepseekError: any) {
            throw new Error(`Ambos proveedores fallaron.`);
        }
    }
}

async function runStressTest() {
    console.log("🚀 INICIANDO SIMULACIÓN DE ESTRÉS IA...");
    const startTime = Date.now();
    
    try {
        const result = await _callProxy("Simulación de optimización de PDC complejo");
        console.log("\n✅ RESULTADO FINAL:", result);
    } catch (e: any) {
        console.error("\n❌ TEST FALLIDO:", e.message);
    }
    
    console.log(`\n⏱️ Tiempo total de simulación: ${Date.now() - startTime}ms`);
}

runStressTest();

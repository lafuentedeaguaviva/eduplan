import { db } from "../lib/database";
import { gemini } from "../lib/geminiWrapper";

const DAILY_LIMIT = 50; // Límite reducido a 50 por día para controlar costos

/**
 * Servicio de IA para gestionar la generación de contenido y la cuota diaria.
 * Ahora basado en el uso personal del usuario vía Google OAuth o llave central.
 */
export const AiService = {
    /**
     * Helper: Genera usando OAuth (Token de Google).
     */
    async generateWithOAuth(userId: string, accessToken: string, prompt: string, context?: string) {
        return this.generate(userId, { accessToken }, prompt, context);
    },

    /**
     * Helper: Genera usando API Key persistida.
     */
    async generateWithApiKey(userId: string, apiKey: string, prompt: string, context?: string) {
        return this.generate(userId, { apiKey }, prompt, context);
    },

    /**
     * Genera texto usando las credenciales proporcionadas y rastrea la cuota diaria.
     */
    async generate(userId: string, credentials: { accessToken?: string; apiKey?: string }, prompt: string, context?: string, customDb?: any) {
    const client = customDb || db;
    
    // 1. Verificar/Actualizar contador diario y obtener API Key si es necesaria
    const { data: profile, error: profileError } = await client
      .from("perfiles")
      .select("solicitudes_ia_hoy, ultima_solicitud_ia, gemini_api_key")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      throw new Error("No se pudo verificar el perfil del usuario.");
    }

    // 2. En el modelo centralizado ya no validamos credenciales locales.
    // El proxy en api/gemini se encarga de usar la API Key del entorno.
    const finalCredentials = {
        accessToken: credentials.accessToken || '',
        apiKey: credentials.apiKey || profile.gemini_api_key || ''
    };

    // Lógica de reseteo diario
    const now = new Date();
    const lastRequest = profile.ultima_solicitud_ia ? new Date(profile.ultima_solicitud_ia) : null;
    const isSameDay = lastRequest && 
                      lastRequest.getDate() === now.getDate() && 
                      lastRequest.getMonth() === now.getMonth() && 
                      lastRequest.getFullYear() === now.getFullYear();

    const currentRequests = isSameDay ? (profile.solicitudes_ia_hoy || 0) : 0;

    if (currentRequests >= DAILY_LIMIT) {
      throw new Error("Has alcanzado el límite diario de solicitudes de IA.");
    }

    // console.log(`\n\n========== PROMPT ENVIADO A IA (GENERAL) ==========\n${prompt}\n====================================================\n`);

    // 3. Llamar a la IA (Preferir DeepSeek según solicitud del usuario)
    let result;
    try {
        const deepseekKey = process.env.DEEPSEEK_API_KEY;
        if (!deepseekKey) throw new Error("No DeepSeek key");
        
        const dsResult = await (await import("../lib/deepseekWrapper")).deepseek.generateContent(prompt, { apiKey: deepseekKey }, context);
        result = { ...dsResult, provider: 'deepseek' };
    } catch (dsError) {
        console.warn("DeepSeek no disponible, usando Gemini como fallback:", dsError);
        const gResult = await gemini.generateContent(prompt, finalCredentials, context);
        result = { ...gResult, provider: 'gemini' };
    }

    // 4. Actualizar contador diario y fecha de última solicitud
    const { error: updateError } = await client
      .from("perfiles")
      .update({ 
          solicitudes_ia_hoy: currentRequests + 1,
          ultima_solicitud_ia: now.toISOString()
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Error actualizando contador IA:", updateError);
    }

    // 4. Registrar log detallado
    await client.from("ia_consumo_logs").insert({
      usuario_id: userId,
      prompt_tokens: result.usage?.promptTokenCount || 0,
      completion_tokens: result.usage?.candidatesTokenCount || 0,
      total_tokens: result.usage?.totalTokenCount || 0,
      tipo_operacion: result.provider === 'deepseek' ? "deepseek_generacion" : (finalCredentials.accessToken ? "oauth_generacion" : "apikey_generacion"),
      proveedor: result.provider,
    });

    return result.text;
  },

  /**
   * Obtiene la cuota diaria actual del usuario.
   */
  async getQuotaPercentage(userId: string) {
    const { data: profile, error } = await db
      .from("perfiles")
      .select("solicitudes_ia_hoy, ultima_solicitud_ia")
      .eq("id", userId)
      .single();
    
    if (error || !profile) {
        return { percentage: 0, current: 0, limit: DAILY_LIMIT };
    }

    const now = new Date();
    const lastRequest = profile.ultima_solicitud_ia ? new Date(profile.ultima_solicitud_ia) : null;
    const isSameDay = lastRequest && 
                      lastRequest.getDate() === now.getDate() && 
                      lastRequest.getMonth() === now.getMonth() && 
                      lastRequest.getFullYear() === now.getFullYear();

    const current = isSameDay ? (profile.solicitudes_ia_hoy || 0) : 0;
    const percentage = Math.min(100, (current / DAILY_LIMIT) * 100);

    return { percentage, current, limit: DAILY_LIMIT };
  }
};

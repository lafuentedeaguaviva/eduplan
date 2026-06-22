/**
 * Wrapper para interactuar con Google Gemini AI usando REST y OAuth.
 * Permite usar el token de acceso del usuario logueado con Google.
 */
export const gemini = {
  /**
   * Genera contenido usando el método de autenticación proporcionado.
   * @param config - Objeto con prompt, token de acceso opcional o API key opcional.
   */
  async generateContent(prompt: string, credentials: { accessToken?: string, apiKey?: string }, systemContext?: string) {
    const { accessToken, apiKey } = credentials;
    
    if (!accessToken && !apiKey) {
      throw new Error("No se proporcionó un método de autenticación (Token o API Key).");
    }

    // gemini-1.5-flash: Más estable para cuotas gratuitas y alta velocidad.
    const MODEL = "gemini-1.5-flash";
    
    // Llamada directa a la API de Google Gemini.
    // La resiliencia (reintentos, backoff, failover) se maneja en aiOptimization.service.ts
    // El rate limiting y logging se gestionan en ai.service.ts + tabla ia_consumo_logs
    const BASE_URL = 'https://generativelanguage.googleapis.com';
    let url = `${BASE_URL}/v1beta/models/${MODEL}:generateContent`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (apiKey) {
      url += `?key=${apiKey}`;
      // Nota: x-goog-api-key también funciona en headers, pero ?key es el estándar más común para REST
    }

    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: systemContext ? {
        parts: [{ text: systemContext }]
      } : undefined,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      throw new Error(`Error de Gemini API: ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return {
      text,
      usage: data.usageMetadata
    };
  }
};

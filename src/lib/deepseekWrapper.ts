/**
 * Wrapper para interactuar con DeepSeek AI (API compatible con OpenAI).
 * Proporciona una alternativa económica y de alto rendimiento a Gemini.
 */
export const deepseek = {
    /**
     * Genera contenido usando la API de DeepSeek.
     */
    async generateContent(prompt: string, credentials: { apiKey: string }, systemContext?: string) {
        const { apiKey } = credentials;
        
        if (!apiKey) {
            throw new Error("No se proporcionó API Key de DeepSeek.");
        }

        // Endpoint de DeepSeek (Compatible con OpenAI)
        const url = "https://api.deepseek.com/v1/chat/completions";
        
        const body = {
            model: "deepseek-chat",
            messages: [
                ...(systemContext ? [{ role: "system", content: systemContext }] : []),
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 8192, // Aumentado para contextos amplios y batch processing
            stream: false
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("DeepSeek API Error:", errorData);
            throw new Error(`Error de DeepSeek API: ${response.statusText} ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "";

        return {
            text,
            usage: {
                promptTokenCount: data.usage?.prompt_tokens || 0,
                candidatesTokenCount: data.usage?.completion_tokens || 0,
                totalTokenCount: data.usage?.total_tokens || 0
            }
        };
    }
};

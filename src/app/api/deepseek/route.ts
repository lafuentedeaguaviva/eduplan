import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { deepseek } from "@/lib/deepseekWrapper";

/**
 * Proxy API para DeepSeek.
 * Permite usar DeepSeek como alternativa económica a Gemini.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Prioridad: API Key de DeepSeek en env vars (Configuración Global)
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: "No se encontró la API Key de DeepSeek configurada en el servidor." 
      }, { status: 403 });
    }

    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Falta el prompt" }, { status: 400 });
    }

    // Ejecutar generación
    const result = await deepseek.generateContent(prompt, { apiKey }, context);

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error("Error en API DeepSeek:", error);
    
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

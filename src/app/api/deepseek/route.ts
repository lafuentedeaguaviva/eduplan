import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { deepseek } from "@/lib/deepseekWrapper";

/**
 * Proxy API para DeepSeek.
 * Permite usar DeepSeek como alternativa económica a Gemini.
 * Registra consumo de tokens en ia_consumo_logs para el dashboard admin.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

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

    // console.log(`\n\n========== [SERVER] PROMPT A DEEPSEEK ==========\n${prompt}\n==================================================\n`);

    const result = await deepseek.generateContent(prompt, { apiKey }, context);

    console.log(`\n\n========== [SERVER] RESPUESTA DE DEEPSEEK ==========\n${result.text}\n======================================================\n`);

    // Registrar consumo de tokens (espejo de lo que hace /api/gemini vía ai.service)
    await supabase.from("ia_consumo_logs").insert({
      usuario_id: user.id,
      prompt_tokens: result.usage?.promptTokenCount || 0,
      completion_tokens: result.usage?.candidatesTokenCount || 0,
      total_tokens: result.usage?.totalTokenCount || 0,
      tipo_operacion: "deepseek_generacion",
      proveedor: "deepseek",
    }).then(({ error }) => {
      if (error) console.error("Error registrando log DeepSeek:", error);
    });

    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error("Error en API DeepSeek:", error);
    
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

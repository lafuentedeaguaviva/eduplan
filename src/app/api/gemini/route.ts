import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AiService } from "@/services/ai.service";

/**
 * Proxy API para Gemini.
 * Se encarga de la seguridad (verificar sesión) y llamar al servicio de IA usando el token de Google del usuario.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Extraer API Key: Prioridad 1: Perfil de usuario (BYOK), Prioridad 2: Variable de entorno (App Global)
    let apiKey = null;
    
    const { data: profile } = await supabase
        .from('perfiles')
        .select('gemini_api_key')
        .eq('id', user.id)
        .single();
    
    apiKey = profile?.gemini_api_key || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: "No se encontró configuración de IA. Configura tu API Key en el perfil o en el sistema." 
      }, { status: 403 });
    }

    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Falta el prompt" }, { status: 400 });
    }

    // Ejecutar generación usando exclusivamente la API Key
    const text = await AiService.generate(user.id, { apiKey }, prompt, context, supabase);

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Error en API Gemini:", error);
    
    // Extraer el código de estado si es un error de cuota (429)
    let status = 500;
    const errorString = error.message || "";
    
    if (errorString.includes("429") || errorString.includes("Too Many Requests") || errorString.includes("Quota exceeded")) {
        status = 429;
    } else if (errorString.includes("503") || errorString.includes("Service Unavailable")) {
        status = 503;
    }

    return NextResponse.json(
      { error: errorString || "Error interno del servidor" },
      { status }
    );
  }
}

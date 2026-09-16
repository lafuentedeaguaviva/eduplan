import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { deepseek } from "@/lib/deepseekWrapper";
import { AdminService } from "@/services/admin.service";
import { MonetizationService } from "@/services/monetizacion.service";

const DEFAULT_SYSTEM_PROMPT = `
Eres un Experto Pedagogo y Generador de Exámenes.
Tu objetivo es generar una evaluación integral a partir de un Plan de Desarrollo Curricular (PDC).

Debes devolver TU RESPUESTA EXACTAMENTE en este formato JSON, sin texto antes ni después.
Debe poder ser parseado con JSON.parse():

{
  "reactivos": [
    {
      "tipo_reactivo": "multibase",
      "subtipo": "opcion_multiple",
      "nivel_bloom": "Comprender",
      "dimension": "Saber",
      "enunciado_gamificado": "Pregunta...",
      "opciones_json": {"opciones": ["A", "B", "C", "D"]},
      "respuesta_correcta": "A",
      "justificacion_docente": "Por qué es A",
      "puntaje": 10.0
    }
  ],
  "instrumentos": [
    {
      "tipo_instrumento": "rubrica",
      "dimension_evaluada": "Hacer",
      "criterios_json": {
        "criterio1": {"niveles": ["Deficiente", "Excelente"]}
      }
    }
  ]
}

REGLAS DE EVALUACIÓN (MODO AUTOPILOT):
1. **Formato de Preguntas (ESTRICTO)**:
   - Para "Opción Múltiple": DEBE tener EXACTAMENTE cuatro (4) opciones de respuesta.
   - Para "Verdadero/Falso": DEBE tener EXACTAMENTE dos (2) opciones ("Verdadero" y "Falso").
   - Para "Sopa de Letras": DEBE usar subtipo "sopa_de_letras". En "opciones_json" DEBE devolver {"palabras": ["PALABRA1", "PALABRA2"]}.
   - Para "Crucigrama": DEBE usar subtipo "crucigrama". En "opciones_json" DEBE devolver {"pistas": [{"palabra": "TERMINO", "pista": "Definición..."}]}.
   - La 'respuesta_correcta' DEBE indicarse (excepto para sopa_de_letras y crucigrama, donde debe ser null).
2. **Sección 1 (Diagnóstico)**: Crea preguntas sencillas para evaluar saberes previos.
3. **Sección 2 (Ejercicios)**: Divide el contenido del PDC en subtemas y genera ejercicios.
4. **Sección 3 (Gamificado)**: Inventa una narrativa emocionante relacionada al tema.
5. **Sección 4 (Rúbricas)**: Genera rúbricas detalladas para calificar el Hacer y el Ser.
6. **Solucionario**: Añade las respuestas correctas de forma clara en la justificación.
`;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1. Verificar saldo antes de continuar
    const monetizationConfig = await MonetizationService.getConfig();
    const requiredCoins = monetizationConfig.costo_examen;
    
    // As MonetizationService uses the client DB and we have the server one here, we'll fetch manually to be safe with RLS
    const { data: profile, error: profileError } = await supabase
        .from('perfiles')
        .select('monedas_disponibles')
        .eq('id', user.id)
        .single();
        
    const availableCoins = profile?.monedas_disponibles || 0;
    
    if (profileError || availableCoins < requiredCoins) {
        return NextResponse.json({ 
            error: `Saldo insuficiente. Requieres ${requiredCoins} monedas (tienes ${availableCoins}).` 
        }, { status: 402 });
    }


    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Falta API Key de DeepSeek." }, { status: 403 });
    }

    const body = await req.json();
    const { pdcId, pdcContext, criterios, narrativa, config, autoPilot, areaId, materiaNombre } = body;

    if (!pdcContext) {
      return NextResponse.json({ error: "Faltan los datos del PDC" }, { status: 400 });
    }

    let prompt = "";

    if (autoPilot) {
      prompt = `
Genera un examen escrito maestro basado en el siguiente Plan de Desarrollo Curricular (PDC):

ÁREA/MATERIA SELECCIONADA:
${materiaNombre || 'No especificada'}

CONTENIDO DEL PDC:
${pdcContext}

CONFIGURACIÓN ESTRICTA DEL DOCENTE:
- Tipos de Pregunta a Incluir: ${config?.tiposPregunta?.join(", ") || "Opción Múltiple, Verdadero/Falso"}
- Número de Preguntas: ${config?.numeroPreguntas || 10}
- Dificultad Cognitiva: ${config?.dificultad || "Intermedia"}

INSTRUCCIONES AUTOPILOT:
Como IA, tienes control total sobre el diseño. Analiza el contenido de arriba y construye un documento que obligatoriamente contenga estas 4 secciones:
1. EXAMEN DE DIAGNÓSTICO
2. PROBLEMAS O EJERCICIOS (Separados rigurosamente por los temas/subtemas detectados en el PDC)
3. EXAMEN GAMIFICADO (Inventa una narrativa creativa acorde a la materia)
4. INSTRUMENTOS DE CALIFICACIÓN (Rúbricas/Listas de cotejo para calificar el Hacer y el Ser, respetando estrictamente los Criterios y el Instrumento solicitado por el docente en el contexto)

RECUERDA ESTRICTAMENTE LOS FORMATOS:
- Opción Múltiple: 4 opciones.
- Falso/Verdadero: 2 opciones.
- Si en los Tipos de Pregunta se incluye "Sopa de Letras", DEBES agregar un reactivo con "subtipo": "sopa_de_letras" y en "opciones_json": {"palabras": ["P1", "P2"]}.
- Si en los Tipos de Pregunta se incluye "Crucigrama", DEBES agregar un reactivo con "subtipo": "crucigrama" y en "opciones_json": {"pistas": [{"palabra": "P", "pista": "D"}]}.
Asegúrate de devolver estrictamente la estructura JSON solicitada.
`;
    } else {
      // Legacy Mode (por si acaso el maestro lo usa sin autopilot)
      const modulosActivados = [];
      if (config?.diagnostico) modulosActivados.push("- Reactivos de Diagnóstico (Preguntas de conocimiento y de respuesta corta)");
      if (config?.razonamiento) modulosActivados.push("- Ejercicios de Razonamiento (Análisis, preguntas abiertas, estudios de caso)");
      if (config?.bossFinal) modulosActivados.push("- Evaluación Sumativa Gamificada ('Boss Final' o reto mayor)");
      if (config?.solucionario) modulosActivados.push("- Incluir respuestas correctas y justificaciones para el Docente");
      if (config?.rubricas) modulosActivados.push("- Generar Rúbricas y Listas de Cotejo para calificar el Hacer y Ser");
      if (config?.retroalimentacion) modulosActivados.push("- Incluir pautas de retroalimentación en el documento");

      prompt = `
Genera un examen escrito gamificado basado en los siguientes parámetros:

1. CONTEXTO DEL TEMA (PDC):
${pdcContext}

2. CRITERIOS A EVALUAR:
Saber: ${criterios?.saber || 'Conocimiento general del tema'}
Hacer: ${criterios?.hacer || 'Aplicación práctica de los conceptos'}
Ser: ${criterios?.ser || 'Trabajo en equipo y actitud colaborativa'}

3. NARRATIVA GAMIFICADA SELECCIONADA:
${narrativa || 'Ninguna (Evaluación Tradicional)'}

4. MÓDULOS ACTIVADOS PARA LA PRUEBA:
${modulosActivados.join('\n')}

RECUERDA ESTRICTAMENTE LOS FORMATOS PARA EL JSON:
- Opción Múltiple: 4 opciones.
- Falso/Verdadero: 2 opciones.
- Sopa de Letras: opciones_json con {"palabras": ["P1", "P2"]}
- Crucigrama: opciones_json con {"pistas": [{"palabra": "P", "pista": "D"}]}
Por favor, asegúrate de devolver estrictamente la estructura JSON solicitada.
`;
    }

    // 1. Obtener la configuración de IA desde la Base de Datos
    const settings = await AdminService.getGlobalSettings();
    const systemPrompt = settings?.data?.ia_config?.prompts?.exam_generator || DEFAULT_SYSTEM_PROMPT;

    const result = await deepseek.generateContent(prompt, { apiKey }, systemPrompt);

    // Registrar consumo
    await supabase.from("ia_consumo_logs").insert({
      usuario_id: user.id,
      prompt_tokens: result.usage?.promptTokenCount || 0,
      completion_tokens: result.usage?.candidatesTokenCount || 0,
      total_tokens: result.usage?.totalTokenCount || 0,
      tipo_operacion: "deepseek_generacion_examen",
      proveedor: "deepseek",
    });

    let jsonResponse;
    try {
      // Limpiar posibles bloques markdown del inicio/fin
      const cleanText = result.text.replace(/```json/g, "").replace(/```/g, "").trim();
      jsonResponse = JSON.parse(cleanText);

      // Save to Database
      if (pdcId) {
        // 1. Crear examen
        const { data: examenDB, error: exError } = await supabase.from('examenes_generados').insert({
          docente_id: user.id,
          pdc_id: pdcId,
          area_id: areaId || null,
          materia_nombre: materiaNombre || 'Sin Materia',
          titulo: config?.tipo ? `${config.tipo} - ${materiaNombre}` : 'Examen Generado',
          narrativa_gamificada: narrativa || null,
          archivo_url: null, // Si no hay archivo guardado todavía
        }).select().single();

        if (exError) throw new Error("Error al guardar el examen principal: " + exError.message);
        
        // Agregar id al response para devolverlo
        jsonResponse.examen_id = examenDB.id;

        // 2. Guardar Reactivos
        if (jsonResponse.reactivos && jsonResponse.reactivos.length > 0) {
          const reactivosToInsert = jsonResponse.reactivos.map((r: any) => ({
             examen_id: examenDB.id,
             tipo_reactivo: r.tipo_reactivo,
             subtipo: r.subtipo || null,
             nivel_bloom: r.nivel_bloom || null,
             dimension: r.dimension || null,
             enunciado_gamificado: r.enunciado_gamificado,
             opciones_json: r.opciones_json,
             respuesta_correcta: r.respuesta_correcta || null,
             justificacion_docente: r.justificacion_docente || null,
             puntaje: r.puntaje || 0,
          }));
          const { error: reacError } = await supabase.from('reactivos_examen').insert(reactivosToInsert);
          if (reacError) throw new Error("Error guardando reactivos: " + reacError.message);
        }

        // 3. Guardar Instrumentos
        if (jsonResponse.instrumentos && jsonResponse.instrumentos.length > 0) {
           const instToInsert = jsonResponse.instrumentos.map((i: any) => ({
             examen_id: examenDB.id,
             tipo_instrumento: i.tipo_instrumento,
             dimension_evaluada: i.dimension_evaluada,
             criterios_json: i.criterios_json
           }));
           const { error: instError } = await supabase.from('instrumentos_calificacion').insert(instToInsert);
           if (instError) throw new Error("Error guardando instrumentos: " + instError.message);
        }
      }

      // 4. Cobrar las monedas (Deducción al final)
      const nuevoSaldo = availableCoins - requiredCoins;
      const { error: updateError } = await supabase
          .from('perfiles')
          .update({ monedas_disponibles: nuevoSaldo })
          .eq('id', user.id);
          
      if (!updateError) {
          await supabase.from('historial_transacciones').insert({
              perfil_id: user.id,
              tipo: 'Gasto IA',
              descripcion: 'Generación de Examen IA',
              monto_monedas: -requiredCoins,
              saldo_resultante: nuevoSaldo,
          });
      } else {
          console.error("No se pudo descontar las monedas al usuario", user.id);
      }

    } catch (parseError) {

      console.error("Error procesando respuesta o guardando en DB:", parseError, result.text);
      return NextResponse.json({ error: "La IA no devolvió un formato válido o falló el guardado" }, { status: 500 });
    }

    return NextResponse.json(jsonResponse);

  } catch (error: any) {
    console.error("Error en API de Generación de Exámenes:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}

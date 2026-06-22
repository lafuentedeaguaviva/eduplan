import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePrompts() {
    const { data, error } = await supabase
        .from('configuracion_global')
        .select('*')
        .eq('id', 'current_config')
        .single();

    if (error) {
        console.error('Error fetching global config:', error);
        return;
    }

    if (data && data.ia_config && data.ia_config.prompts) {
        const prompts = data.ia_config.prompts;

        if (prompts.weekly_batch) {
            console.log('Current weekly_batch prompt length:', prompts.weekly_batch.length);
            
            // Reemplazar el prompt directamente o actualizar las reglas
            const updatedPrompt = `**Reglas de contenido (ESTRICTAS):**
- Para "momentos_ia": Presenta la Práctica, Teoría, Producción y Valoración (si existen datos de entrada para ellos) en una lista usando el símbolo de viñeta "- ".
- ESTRICTAMENTE PROHIBIDO usar palabras de enlace o conectores temporales entre los momentos (como "luego", "a continuación", "después", "posteriormente", etc.). Cada momento debe ser un punto independiente en la lista.
- El texto debe estar en Presente de Indicativo, primera persona del plural (forma inclusiva: "aprendemos", "conocemos", etc.) describiendo el proceso de aprendizaje.
- Identifica el momento poniendo la etiqueta entre paréntesis: (Práctica), (Teoría), (Producción) o (Valoración) ÚNICAMENTE AL FINAL de cada punto de la lista correspondiente a ese momento. NUNCA como título inicial ni encima.
- NO menciones días de la semana ni fechas bajo ninguna circunstancia.
- Para "recursos_fuentes_ia", "adaptaciones_basicas_ia", "adaptaciones_especiales_ia": texto profesional. Si no hay datos de entrada, devuelve cadena vacía "".
- Debes devolver exactamente un objeto por cada semana en la entrada, manteniendo su "semana_id".`;

            prompts.weekly_batch = prompts.weekly_batch.replace(/\*\*Reglas de contenido \(ESTRICTAS\):\*\*[\s\S]*?(?=\n\*\*Datos de Semanas:\*\*)/, updatedPrompt);

            data.ia_config.prompts = prompts;

            const { data: updatedData, error: updateError } = await supabase
                .from('configuracion_global')
                .update({ ia_config: data.ia_config })
                .eq('id', 'current_config');

            if (updateError) {
                console.error('Error updating config:', updateError);
            } else {
                console.log('Config updated successfully');
            }
        } else {
            console.log('No weekly_batch prompt found in config');
        }
    } else {
        console.log('No prompts config found in db');
    }
}

updatePrompts();

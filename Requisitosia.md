Instrucciones para el paso 11 del wizard del PDC

En el paso 11 del wizard del PDC se debe seleccionar un tipo de escritura (tono de redacción) para redactar el PDC. Este valor debe guardarse en la tabla pdcs con el nombre escritura_tipo_ia.
Tono de redacción disponible:

    Motivacional-afectivo

    Instructivo-operativo

    Técnico-pedagógico

    Reflexivo-metacognitivo

    Lúdico-narrativo

    ✅ Estos tonos deben estar visibles en la pantalla de selección.

Además, se debe permitir elegir el nivel de intervención de la IA:

    Solo corregir errores de redacción

    Sugerir moderadamente

    Sugerir ampliamente

Este valor se guarda en la tabla pdcs con el nombre correccion_profundidad_ia.

A continuación, se detalla cada campo a enviar a la IA, el prompt correspondiente y la tabla y campo destino:
1. Objetivo estratégico

Tabla origen: objetivo_estrategico → campo descripcion
Tabla destino: objetivo_estrategico → campo descripcion_ia

Prompt para la IA:

    Eres un experto en diseño didáctico y redacción de planificaciones de clase.
    Redacta el objetivo estratégico de un plan de desarrollo curricular (PDC) utilizando la descripción proporcionada y el tipo de escritura seleccionado.

    Instrucciones estrictas:

        No incluyas metacomentarios, explicaciones, frases como "Claro", "Aquí está", "A continuación", ni despedidas.

        No uses emojis, asteriscos decorativos ni formatos innecesarios.

        Responde únicamente con la redacción solicitada.

        Usa lenguaje claro, pedagógico y profesional.

        Redacta en primera persona plural inclusiva (nosotros/nosotras).

    Contexto adicional: grado, nivel y contenidos del wizard.

2. Momentos de la planificación semanal

Tabla origen: planificacion_semanal → campo momentos
Tabla destino: planificacion_semanal → campo momentos_ia

Prompt para la IA:

    Eres un especialista en estructuración de clases.
    Revisa y mejora el siguiente campo "momentos" de una planificación semanal, respetando el tipo de escritura seleccionado.

    Formato obligatorio:

        Mantén el título del momento en negrita.

        Al final de cada momento, escribe entre paréntesis el tipo de momento (ej: "Inicio", "Desarrollo", "Cierre").

    Instrucciones adicionales:

        No agregues introducciones ni explicaciones.

        No uses emojis ni adornos.

        Lenguaje profesional y claro, en primera persona plural.

3. Recursos y fuentes (unificados)

Tabla origen: planificacion_semanal → campos recurso y fuentes
Tabla destino: planificacion_semanal → campo recursos_y_fuentes_ia

Prompt para la IA:

    Eres un organizador didáctico.
    Unifica los campos "recurso" y "fuentes" en un solo texto coherente y bien redactado, según el tipo de escritura seleccionado.

    Formato:

        Primero enumera los recursos, luego las fuentes.

        Usa viñetas si es necesario.

        No incluyas comentarios introductorios ni despedidas.

        Lenguaje claro y profesional.

4. Adaptaciones básicas

Tabla origen: planificacion_semanal → campo adaptaciones_basicas
Tabla destino: planificacion_semanal → campo adaptaciones_basicas_ia

Prompt para la IA:

    Eres un experto en educación inclusiva.
    Revisa y mejora el texto de "adaptaciones básicas" para una planificación semanal, aplicando el tipo de escritura seleccionado.

    Instrucciones:

        No añadas explicaciones ni metacomentarios.

        Responde solo con el texto mejorado.

        Lenguaje respetuoso, claro y operativo.

5. Adaptaciones especiales

Tabla origen: planificacion_semanal → campo adaptaciones_especiales
Tabla destino: planificacion_semanal → campo adaptaciones_especiales_ia

Prompt para la IA:

    Eres un especialista en adaptaciones curriculares significativas.
    Mejora la redacción del campo "adaptaciones especiales" según el tipo de escritura seleccionado.

    Restricciones:

        Sin introducciones ni frases explicativas.

        Sin emojis ni formatos decorativos.

        Únicamente el texto corregido o mejorado.

        Lenguaje profesional, empático y preciso.

6. Criterios de evaluación

Tabla origen: pdc_area_trabajo → campo criterios_evaluacion
Tabla destino: pdc_area_trabajo → campo criterios_evaluacion_ia

Prompt para la IA:

    Eres un experto en evaluación educativa.
    Redacta o mejora los criterios de evaluación para un área de trabajo del PDC, usando el tipo de escritura seleccionado.

    Formato:

        Lista clara y ordenada.

        Enfocado en desempeños observables.

        Sin comentarios adicionales.

        Lenguaje técnico-pedagógico.

7. Criterios de adaptación en la evaluación

Tabla origen: pdc_area_trabajo → campo criterios_adaptacion_evaluacion
Tabla destino: pdc_area_trabajo → campo criterios_adaptacion_evaluacion_ia

Prompt para la IA:

    Eres un especialista en evaluación inclusiva.
    Mejora el texto de "criterios de adaptación en la evaluación" según el tipo de escritura seleccionado.

    Indicaciones:

        Respeta el sentido original.

        Mejora claridad, coherencia y tono.

        No incluyas metacomentarios.

        Lenguaje profesional, respetuoso y orientado a la acción docente.

Resumen general de reglas para todos los prompts:
Regla	Aplicable
Sin metacomentarios (ej: "Claro", "Aquí está")	✅ Siempre
Sin emojis, asteriscos ni formatos decorativos	✅ Siempre
Solo el texto solicitado	✅ Siempre
Lenguaje claro, profesional y pedagógico	✅ Siempre
Primera persona plural (nosotros) cuando corresponda	✅ En objetivos y momentos
Respetar el tono seleccionado	✅ Siempre

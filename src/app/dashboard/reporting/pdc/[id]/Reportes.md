Crea un campo denominado descripcionia en la tabla objetivo_estrategico
Crea un campo denominado criterios_evaluacionia en la tabla pdcs_area_trabajo
Crea un campo denominado adaptaciones_curriculares_no_significativasia en la tabla pdcs_area_trabajo
Crea un campo denominado momentosia en la tabla planificacion_semanal
Crea un campo denominado recursosyfuentesia en la tabla planificacion_semanal
Crea un campo denominado criterios_evaluacion_adaptacionesia en la tabla pdcs_area_trabajo
Crea un campo denominado discapacidad_tdh_tea_y_otrosia en la tabla planificacion_semanal
Crea un campo denominado adaptaciocurriculares_significativasia en la tabla planificacion_semanal

Son 4 tipos de reporte que se deben realizar:
1. Plan de Desarrollo Curricular (PDC) Inicial
2. Plan de Desarrollo Curricular (PDC) Primaria 
3. Plan de Desarrollo Curricular (PDC) Secundaria
4. Plan de Desarrollo Curricular (PDC) Multigrado

De acuerdo al nivel de cada PDC se debe generar el reporte correspondiente.

Para el Plan de Desarrollo Curricular (PDC) InicialPrimaria y Secundaria se tendra el siguiente reporte:

El reporte debe tener el siguiente formato:
1. DATOS REFERENCIALES
2. DESARROLLO

Se debe tener en cuenta que un pdc puede tiene varias pdcs_areas_trabajo que ademas tienen varias areas_trabajo, por lo que se debe mostrar los datos de todas las areas de trabajo.Las consultas se deben hacer teniendo el id del pdc correspondiente a un perfil profesor.

Detallare cada uno de los campos:

1. DATOS REFERENCIALES
- Distrito Educativo: Aqui se debe mostrar los Distritos Educativos separados por "/", si son duplicados solo debe mostrar uno.
- Unidad Educativa: Aqui se debe mostrar las Unidades Educativas separadas por "/", si son duplicados solo debe mostrar una.
- Nivel: Aqui se debe mostrar los Niveles separados por "/", si son duplicados solo debe mostrar uno.
- Año de Escolaridad: Aqui se debe mostrar los Grados separados por "/", si son duplicados solo debe mostrar uno, ademas se debe colocar tambien los Paralelos de Cada grado, separados por ",", si son duplicados solo debe mostrar uno.
-Director/a: Aqui se debe mostrar el nombre del Director/a.
-Maestro/a: Aqui se debe mostrar el nombre del Maestro/a.El nombre debe estar con el  titulo profesional, el nombre y el apellido.
- Area: Aqui se debe mostrar las Areas de conocimiento separadas por "/", si son duplicados solo debe mostrar una.
-Trimestre: Aqui se debe mostrar el Trimestre.
-Mes: Aqui se debe mostrar el Mes.
-Del: Aqui se debe mostrar la fecha de inicio.
-Al: Aqui se debe mostrar la fecha de fin.

A continuacion te mostrare de donde sacar los datos de cada campo:


-Distrito Educativo: Esto se encuentra en la tabla distritos.nombre
- Unidad Educativa: Esto se encuentra en la tabla unidades_educativas.nombre    
- Nivel: Esto se encuentra en la tabla niveles.nombre.
- Año de Escolaridad: Esto se encuentra en la tabla grados.nombre
-Director/a: Esto se deb concatenar respetando espacios el titulo de perfil.titulo, el nombre de la tabla perfiles.nombres y el apellido de la tabla perfiles.apellidos
-Maestro/a: Esto se deb concatenar respetando espacios el titulo de perfil.titulo, el nombre de la tabla perfiles.nombres y el apellido de la tabla perfiles.apellidos
- Area: Esto se encuentra en la tabla areas_conocimiento.nombre
-Trimestre: Esto se encuentra en la tabla pdcs.trimestre
-Mes: Esto se encuentra en la tabla pdcs.mes
-Del: Esto se encuentra en la tabla pdcs.fecha_inicio
-Al: Esto se encuentra en la tabla pdcs.fecha_fin

2. DESARROLLO
- Objetivo holístico de nivel: Aqui se debe mostrar el Objetivo Holístico de Nivel, segun el nivel que corresponda.

Esto lo puedes sacar de la tabla niveles.objetivo_holistico

Para cada pdcs_areas_trabajo se debe mostrar:

    -Area de saberes y conocimientos: Aqui se debe mostrar el nombre del Area de saberes y conocimientos.

    -Objetivos de Aprendizaje: Aqui se debe mostrar los Objetivos de Aprendizaje.
    Para cada semana se debe mostrar:
        -Contenidos: Aqui se debe mostrar los Contenidos, por semana, se debe mostrar los temas y subtemas de manera ordenada.
        -Momentos de proceso formativo: Se debe mostrar los momentos de proceso formativo, por semana.
        -Recursos: Se debe mostrar los recursos y las fuentes, por semana.
        -Periodos: Se debe mostrar los periodos, por semana.
       
    -Criterios de Evaluación: Aqui se debe mostrar los Criterios de Evaluación.
    -Adaptaciones Curriculares no significativas: Aqui se debe mostrar las Adaptaciones Curriculares.

    -Adaptaciones Curriculares significativas: Aqui se debe mostrar las Adaptaciones Curriculares significactivas por semana, esto debe contener:
    -Contenidos: Aqui se debe mostrar los Contenidos, por semana, se debe mostrar los temas y subtemas de manera ordenada.
    -Discapacidad/TDH/TEA y otros: Aqui se debe mostrar la discapacidad, TDH, TEA y otros.
    -Adaptación:Se debe mostrar las adaptaciones curriculares significativas, por semana.
    -Criterio de evaluación: Se debe mostrar el criterio de evaluación, por semana.

 Luego continumaos con las siguientes pdcs_areas_trabajo.

 Ahora te dire como sacar los datos de cada campo:

 -Area de saberes y conocimientos: Esto se encuentra en la tabla areas_conocimiento.nombre
 -Objetivos de Aprendizaje: Esto se encuentra en la tabla objetivos_estrategico.descripcionia
 -Contenidos: Esto se encuentra en la tabla contenidos_usuario.titulo
 -Momentos de proceso formativo: Esto se encuentra en la tabla planificacion_semanal.momentosia
 -Recursos: Esto se encuentra en la tabla planificacion_semanal.recursosyfuentesia
 -Periodos: Esto se encuentra en la tabla pdcs_area_trabajo.periodos
 -Criterios de Evaluación: Esto se encuentra en la tabla pdcs_area_trabajo.criterios_evaluacionia
 -Adaptaciones Curriculares no significativas: Esto se encuentra en la tabla pdcs_area_trabajo.adaptaciones_curriculares_no_significativasia
 
 -Adaptaciones Curriculares significativas: Esto se encuentra en la tabla planificacion_semanal.adaptaciocurriculares_significativasia
 -Discapacidad/TDH/TEA y otros: Esto se encuentra en la tabla planificacion_semanal.discapacidad_tdh_tea_y_otrosia
 -Adaptación:Esto se encuentra en la tabla pdcs_area_trabajo.criterios_evaluacion_adaptacionesia
 -Criterio de evaluación: Esto se encuentra en la tabla pdcs_area_trabajo.criterios_evaluacion_adaptacionesia

Firma del Director/a: Aqui se debe mostrar el Nombre del Director/a listo para la firma.
Firma del Maestro/a: Aqui se debe mostrar el Nombre del Maestro/a listo para la firma.

   


# Documentación del Módulo de Momentos Formativos (Paso 8)

## 1. Visión General
El módulo de **Momentos del Proceso Formativo** es el núcleo de la planificación semanal en EduPlan Pro. Permite a los docentes diseñar secuencialmente sus clases utilizando una biblioteca de sugerencias pedagógicas y consolidando un orden cronológico para el reporte final.

## 2. Arquitectura de Datos
El sistema utiliza un patrón de **Biblioteca vs. Instancia**:
- **Tablas de Biblioteca (Read-Only)**: `biblioteca_practica`, `biblioteca_teoria`, etc. Contienen el currículo base y ejemplos por nivel.
- **Tablas de Instancia (Write)**: `practica`, `teoria`, `produccion`, `valoracion`, `adaptaciones_basicas`, `recursos`, `mi_fuente`. Estos registros pertenecen a una `planificacion_semanal_id` específica.
- **Consolidación JSONB**: Al finalizar el diseño semanal, el orden de los momentos, los recursos y las fuentes se sincronizan en columnas JSONB de la tabla `planificacion_semanal` para facilitar la generación de reportes y mejorar el rendimiento de lectura.

## 3. Flujo de Trabajo del Usuario (The Wizard)
El Wizard consta de 8 pestañas interconectadas:

1.  **Práctica**: Selección de actividades motivadoras y preguntas activadoras.
2.  **Teoría**: Definición de estrategias de enseñanza y contenidos teóricos.
3.  **Producción**: Especificación de los productos tangibles que los estudiantes crearán.
4.  **Valoración**: Configuración de instrumentos de evaluación y reflexión.
5.  **Adaptaciones**: Ajustes curriculares para estudiantes con necesidades específicas.
6.  **Recursos**: Selección de materiales y herramientas tecnológicas.
7.  **Fuentes**: Gestión de bibliografía personal y sugerida.
8.  **Consolidación (NUEVO)**: Interfaz para reordenar cronológicamente los momentos de las primeras 4 pestañas y persistir el diseño final.

## 4. Lógica de Persistencia y Sincronización
- **Guardado Individual**: Cada pestaña permite guardar elementos de forma independiente en sus respectivas tablas de instancia.
- **Sincronización JSONB**: 
    - El orden de los momentos se guarda explícitamente en la pestaña de **Consolidación**.
    - Los **Recursos** y **Fuentes** se sincronizan automáticamente al navegar del Paso 8 al Paso 9, garantizando integridad de datos sin esfuerzo manual.

## 5. Componentes Clave
- `MomentosProceso.tsx`: Contenedor principal y gestor de navegación entre semanas y pestañas.
- `MomentoLibrary.tsx`: Buscador jerárquico que lee de las bibliotecas de Supabase.
- `MomentoEditor.tsx`: Formulario dinámico para personalizar el contenido instanciado.
- `MomentoSavedList.tsx`: Lista de control de elementos ya guardados en la semana.
- `MomentoConsolidator.tsx`: Herramienta de ordenación con soporte para reordenamiento manual.

## 6. Próximos Pasos
- [ ] Implementar Drag & Drop en `MomentoConsolidator` para una mejor experiencia UX.
- [ ] Integrar previsualización en tiempo real del documento PDF basado en los campos JSONB.
- [ ] Añadir sugerencias por IA basadas en los contenidos seleccionados en el Paso 6.

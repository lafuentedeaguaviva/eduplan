# Historial de Versiones (Changelog) - EduPlan Pro

Este documento registra los cambios, nuevas características y correcciones implementadas en cada versión de la plataforma.

## [v0.2.4] - Septiembre 2026

### ✨ Nuevas Características
- **Panel Avanzado de Finanzas**: Se reestructuró la pestaña de administración financiera para ofrecer control total sobre las métricas, ganancias, costos fijos y el gasto real de la IA (DeepSeek).
- **Asignación Manual (Modelo B2B)**: Se implementó un buscador global de profesores (por nombre o email) dentro del panel de Finanzas, permitiendo inyectar "Bonos Demo" manualmente a usuarios específicos. 
- **Código QR Dinámico**: El administrador ahora puede configurar en tiempo real la URL de la imagen del código QR bancario desde su panel. Los docentes verán esta imagen de forma dinámica al seleccionar "Pagar con QR" en la Billetera.
- **Acceso Directo**: Se añadió el botón de acceso rápido al módulo de *Finanzas* en la barra lateral exclusiva para roles de Administrador.

### 🐛 Corrección de Errores (Fixes)
- **Carga de Datos en Finanzas**: Se corrigió un error en cadena que provocaba que todo el panel de Finanzas colapsara. Se solucionó (1) la inicialización de la configuración vacía y (2) el desajuste de columnas de bases de datos (`correo` vs `email`, y `creado_en` vs `fecha_solicitud`) en las consultas de `pagos_qr` y `perfiles`.

## [v0.2.3] - Septiembre 2026

### ✨ Nuevas Características
- **Páginas Legales y de Privacidad**: Se crearon las páginas públicas de **Política de Privacidad** (`/privacidad`) y **Condiciones del Servicio** (`/terminos`). Esto es un requisito fundamental para aprobar la pantalla de consentimiento de OAuth en Google Cloud.
- **Enlaces en el Footer**: Se añadieron accesos directos a las páginas legales en el pie de página de la página principal (Landing Page).
- **Tablero de EduCoins**: Se actualizó el panel principal (`dashboard`) de los docentes. Ahora la interfaz muestra de forma dinámica la cantidad real de **EduCoins** (`monedas_disponibles`) del usuario, reemplazando el antiguo indicador estático de "Cuota IA".

### 🛠️ Mejoras Técnicas
- **Limpieza de Configuración**: Se eliminó la configuración obsoleta de ESLint en `next.config.ts`, previniendo advertencias molestas durante el servidor de desarrollo y la compilación en Next.js 16.

---

## [v0.2.2] - Septiembre 2026

### 🐛 Corrección de Errores Críticos (Hotfix)
- **Login de Google en Producción**: Se resolvió un problema crítico donde Next.js (corriendo dentro de un contenedor Docker en Ubuntu) ignoraba las cabeceras del servidor proxy (Nginx) y redirigía a los usuarios a `http://0.0.0.0:3000` en lugar del dominio de producción al iniciar sesión.
- **Resolución de Origen Seguro**: Se modificó la ruta `auth/callback/route.ts` para que construya el dominio de redirección de manera segura basándose en las cabeceras `X-Forwarded-Host` y `X-Forwarded-Proto` entregadas por Nginx, solucionando los errores `502 Bad Gateway` y bucles de redirección.

# Historial de Versiones (Changelog) - EduPlan Pro

Este documento registra los cambios, nuevas características y correcciones implementadas en cada versión de la plataforma.

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

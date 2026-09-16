import Link from 'next/link';

export default function PrivacidadPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16 px-6 sm:px-12 lg:px-24 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto bg-white p-10 sm:p-16 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors mb-8">
                        <span className="material-symbols-rounded mr-2">arrow_back</span>
                        Volver al inicio
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Política de Privacidad</h1>
                    <p className="text-slate-500">Última actualización: Septiembre 2026</p>
                </div>

                <div className="space-y-8 text-lg leading-relaxed text-slate-600">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introducción</h2>
                        <p>
                            En <strong>EduPlan Pro</strong>, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
                            Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos tu información 
                            cuando utilizas nuestra plataforma de planificación curricular impulsada por Inteligencia Artificial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Información que recopilamos</h2>
                        <p>Podemos recopilar los siguientes tipos de información:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li><strong>Información de la cuenta:</strong> Nombre, correo electrónico (incluyendo la información proporcionada a través de Google OAuth) y foto de perfil.</li>
                            <li><strong>Contenido generado:</strong> Planes de Desarrollo Curricular (PDC), configuraciones y parámetros educativos que ingreses en el sistema.</li>
                            <li><strong>Información de uso:</strong> Datos sobre cómo interactúas con nuestra plataforma, frecuencia de uso de la IA y preferencias.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Uso de los datos de Google OAuth</h2>
                        <p>
                            EduPlan Pro utiliza la autenticación de Google para facilitar tu acceso. 
                            El uso que hace nuestra aplicación de la información recibida de las API de Google se adherirá a la 
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline mx-1">
                                Política de datos del usuario de los Servicios API de Google
                            </a>, incluidos los requisitos de uso limitado.
                        </p>
                        <p className="mt-4">
                            Solo utilizamos tu dirección de correo electrónico, nombre y foto de perfil para identificarte 
                            y crear tu cuenta en nuestro sistema de manera segura. No accedemos a tus correos, contactos 
                            ni otros datos sensibles de tu cuenta de Google.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cómo usamos tu información</h2>
                        <p>Utilizamos tu información para:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Proporcionar, operar y mantener nuestra plataforma.</li>
                            <li>Generar los Planes de Desarrollo Curricular (PDC) mediante Inteligencia Artificial basados en tus solicitudes.</li>
                            <li>Mejorar, personalizar y expandir nuestros servicios.</li>
                            <li>Procesar tus transacciones (compra de EduCoins o suscripciones).</li>
                            <li>Enviarte correos electrónicos relacionados con el servicio, soporte y actualizaciones.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Seguridad de los datos</h2>
                        <p>
                            Implementamos medidas de seguridad técnicas y organizativas diseñadas para proteger tu información 
                            personal contra accesos no autorizados, pérdida, destrucción o alteración. 
                            Todas las credenciales y comunicaciones están cifradas (HTTPS/SSL).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Compartir información</h2>
                        <p>
                            No vendemos, comercializamos ni transferimos a terceros tu información personal identificable. 
                            Esto no incluye a los terceros de confianza (como proveedores de IA u hospedaje) que nos asisten en la 
                            operación de nuestro sitio web, siempre que dichas partes acuerden mantener esta información confidencial.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Tus Derechos</h2>
                        <p>
                            Tienes derecho a acceder, corregir, actualizar o solicitar la eliminación de tu información personal. 
                            Si deseas eliminar tu cuenta o datos, puedes contactarnos a través de nuestros canales de soporte.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contacto</h2>
                        <p>
                            Si tienes preguntas o sugerencias sobre nuestra Política de Privacidad, no dudes en ponerte en contacto 
                            con nuestro equipo de soporte en <strong>soporte@eduplan.pro</strong>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

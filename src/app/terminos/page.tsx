import Link from 'next/link';

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-16 px-6 sm:px-12 lg:px-24 font-sans text-slate-800">
            <div className="max-w-4xl mx-auto bg-white p-10 sm:p-16 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors mb-8">
                        <span className="material-symbols-rounded mr-2">arrow_back</span>
                        Volver al inicio
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Condiciones del Servicio</h1>
                    <p className="text-slate-500">Última actualización: Septiembre 2026</p>
                </div>

                <div className="space-y-8 text-lg leading-relaxed text-slate-600">
                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar <strong>EduPlan Pro</strong>, aceptas cumplir y estar sujeto a estas 
                            Condiciones del Servicio. Si no estás de acuerdo con alguna parte de estos términos, 
                            no podrás acceder a la plataforma ni utilizar nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Descripción del Servicio</h2>
                        <p>
                            EduPlan Pro es una plataforma en línea que asiste a los docentes en la creación, gestión 
                            y optimización de Planes de Desarrollo Curricular (PDC) utilizando herramientas de 
                            Inteligencia Artificial. Nos reservamos el derecho de modificar, suspender o discontinuar 
                            el servicio en cualquier momento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Creación de Cuentas</h2>
                        <p>
                            Para utilizar ciertas funciones de nuestro servicio (como guardar PDCs), debes registrarte y crear una cuenta 
                            utilizando tu correo electrónico o tu cuenta de Google. Eres responsable de mantener la confidencialidad 
                            de tu cuenta y contraseña, y de restringir el acceso a tu computadora o dispositivo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">4. EduCoins y Pagos</h2>
                        <p>
                            EduPlan Pro utiliza un sistema de créditos virtuales llamado "EduCoins" para acceder a las funciones avanzadas 
                            de Inteligencia Artificial.
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Los EduCoins pueden adquirirse mediante pagos QR u otros métodos proporcionados en la plataforma.</li>
                            <li>Las compras de EduCoins son definitivas y <strong>no son reembolsables</strong>, salvo que la ley exija lo contrario.</li>
                            <li>EduPlan Pro se reserva el derecho de ajustar los precios y costos en EduCoins de los servicios de IA en cualquier momento.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Propiedad Intelectual</h2>
                        <p>
                            Todo el contenido, características y funcionalidades de la plataforma (incluyendo, pero no limitado a, 
                            diseño, texto, gráficos e interfaces) son propiedad de EduPlan Pro. Sin embargo, 
                            <strong>tú conservas todos los derechos de propiedad</strong> sobre los Planes de Desarrollo Curricular (PDCs) 
                            que generes y exportes usando nuestra herramienta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Uso de Inteligencia Artificial</h2>
                        <p>
                            Entiendes y aceptas que EduPlan Pro utiliza modelos de Inteligencia Artificial para generar sugerencias 
                            y contenido educativo. Si bien nos esforzamos por brindar contenido de alta calidad:
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>No garantizamos la precisión, pertinencia o viabilidad absoluta del contenido generado por la IA.</li>
                            <li>Es tu responsabilidad como educador profesional revisar, editar y validar el contenido generado antes de aplicarlo en el aula.</li>
                            <li>EduPlan Pro no se hace responsable de consecuencias derivadas de errores u omisiones en el contenido sugerido por la IA.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Uso Aceptable</h2>
                        <p>Aceptas no utilizar el servicio para:</p>
                        <ul className="list-disc pl-6 mt-4 space-y-2">
                            <li>Cualquier propósito ilegal o no autorizado.</li>
                            <li>Violar cualquier ley en tu jurisdicción (incluidas las leyes de derechos de autor).</li>
                            <li>Intentar vulnerar, interferir o interrumpir la integridad o el rendimiento del servicio.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Modificación de los Términos</h2>
                        <p>
                            Nos reservamos el derecho de modificar o reemplazar estas Condiciones del Servicio en cualquier momento. 
                            Los cambios entrarán en vigor inmediatamente después de su publicación en esta página. 
                            El uso continuado de la plataforma después de cualquier cambio constituye tu aceptación de los nuevos términos.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

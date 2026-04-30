'use client';

import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SettingsPage() {
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Configuración"
                subtitle="Personaliza tu experiencia en EduPlan Pro."
                icon="settings"
            />

            {/* Preferences */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Preferencias de Interfaz</h2>
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium text-slate-900">IA Autogestionada</h3>
                            <p className="text-sm text-slate-500">Tu cuenta de Google gestiona automáticamente el acceso a Gemini.</p>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Activo
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium text-slate-900">Tema Oscuro</h3>
                            <p className="text-sm text-slate-500">Cambiar entre tema claro y oscuro.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200">
                            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Notificaciones</h2>
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium text-slate-900">Alertas por Correo</h3>
                            <p className="text-sm text-slate-500">Recibir resumen semanal de planificaciones.</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Account */}
            <section className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 text-red-600">Zona de Peligro</h2>
                <div className="bg-red-50 rounded-xl border border-red-100 p-5 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-red-900">Eliminar Cuenta</h3>
                        <p className="text-sm text-red-700/80">Esta acción no se puede deshacer.</p>
                    </div>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300">
                        Eliminar Cuenta
                    </Button>
                </div>
            </section>
        </div>
    );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { createClient } from '@/utils/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Feedback } from '@/components/ui/feedback';

export default function CompleteProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState<any>(null);
    
    const [formData, setFormData] = useState({
        titulo: 'Profesor',
        nombres: '',
        apellidos: '',
        celular: '',
        genero: 'Hombre',
    });
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const [feedback, setFeedback] = useState({
        isOpen: false,
        type: 'error' as 'error' | 'success',
        title: '',
        description: ''
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            
            setUser(session.user);
            const metadata = session.user.user_metadata;
            
            setFormData(prev => ({
                ...prev,
                nombres: metadata?.nombres || metadata?.full_name?.split(' ')[0] || '',
                apellidos: metadata?.apellidos || metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            }));
            
            setInitializing(false);
        };
        checkUser();
    }, [router, supabase]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!aceptaTerminos) {
                throw new Error("Debe aceptar los Términos y Condiciones para continuar.");
            }

            let foto_url = null;
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const { error: uploadError, data } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
                if (!uploadError && data) {
                    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
                    foto_url = publicUrl;
                }
            } else if (user.user_metadata?.avatar_url || user.user_metadata?.picture) {
                foto_url = user.user_metadata?.avatar_url || user.user_metadata?.picture;
            } else {
                foto_url = formData.genero === 'Mujer' ? 'https://ui-avatars.com/api/?name=' + formData.nombres + '+' + formData.apellidos + '&background=random&gender=female' : 'https://ui-avatars.com/api/?name=' + formData.nombres + '+' + formData.apellidos + '&background=random&gender=male';
            }

            // 1. Crear el perfil
            const profileRes = await AuthService.createProfile({
                id: user.id,
                email: user.email,
                titulo: formData.titulo,
                nombres: formData.nombres,
                apellidos: formData.apellidos,
                celular: formData.celular,
                genero: formData.genero,
                foto_url: foto_url,
                estado_completitud: true
            } as any);

            if (!profileRes.success) throw new Error(profileRes.error?.message);

            // 2. Asignar rol por defecto
            // (Ya se hace en el trigger si funcionara, pero lo forzamos aquí por seguridad)
            
            setFeedback({
                isOpen: true,
                type: 'success',
                title: '¡Perfil Completado!',
                description: 'Bienvenido a la plataforma. Redirigiendo al escritorio...'
            });

            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (err: any) {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Error al Guardar',
                description: err.message || 'No se pudo completar el perfil.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (initializing) return <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-white font-black animate-pulse uppercase tracking-[0.3em]">Inicializando Entorno...</div>;

    return (
        <div className="min-h-screen bg-[#0a0c10] relative overflow-hidden font-sans flex items-center justify-center p-6">
            {/* Background Architecture */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full animate-float"></div>
            </div>

            <div className="relative z-10 w-full max-w-xl animate-fade-in-up">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">
                        Casi <span className="text-emerald-400">Listo</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Personaliza tu identidad docente</p>
                </div>

                <div className="bg-[#11141b]/90 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
                    {feedback.isOpen && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-[#11141b]/90 backdrop-blur-md">
                            <Feedback
                                variant={feedback.type}
                                title={feedback.title}
                                description={feedback.description}
                                onClose={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
                                className="bg-transparent border-none text-white shadow-none"
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Título Profesional</label>
                            <select
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleInputChange}
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            >
                                <option className="bg-[#11141b]" value="Profesor">Profesor / Profesora</option>
                                <option className="bg-[#11141b]" value="Licenciado">Licenciado / Licenciada</option>
                                <option className="bg-[#11141b]" value="Doctor">Doctor / Doctora</option>
                                <option className="bg-[#11141b]" value="Magister">Magíster</option>
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Género</label>
                                <select
                                    name="genero"
                                    value={formData.genero}
                                    onChange={handleInputChange}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-bold outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option className="bg-[#11141b]" value="Hombre">Hombre</option>
                                    <option className="bg-[#11141b]" value="Mujer">Mujer</option>
                                    <option className="bg-[#11141b]" value="Otro">Otro</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Avatar (Opcional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 focus:outline-none transition-all flex items-center"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Nombres"
                                name="nombres"
                                value={formData.nombres}
                                onChange={handleInputChange}
                                required
                                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl"
                            />
                            <Input
                                label="Apellidos"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleInputChange}
                                required
                                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl"
                            />
                        </div>

                        <Input
                            label="Celular / WhatsApp"
                            name="celular"
                            placeholder="70000000"
                            value={formData.celular}
                            onChange={handleInputChange}
                            required
                            className="bg-white/5 border-white/10 text-white h-14 rounded-2xl"
                            icon={<span className="material-symbols-rounded text-emerald-500">phone_iphone</span>}
                        />

                        <div className="flex items-start gap-3 mt-4 px-2">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={aceptaTerminos}
                                onChange={(e) => setAceptaTerminos(e.target.checked)}
                                className="mt-1 size-4 rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                            />
                            <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed cursor-pointer select-none">
                                He leído y acepto los <span className="text-emerald-400 font-bold hover:underline">Términos y Condiciones</span> y la <span className="text-emerald-400 font-bold hover:underline">Política de Privacidad</span> de EduPlan Pro.
                            </label>
                        </div>

                        <Button
                            type="submit"
                            isLoading={loading}
                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 mt-4"
                        >
                            FINALIZAR CONFIGURACIÓN
                        </Button>
                    </form>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float { 0% { transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
                @keyframes pulse-slow { 0% { opacity: 0.1; } 50% { opacity: 0.2; } 100% { opacity: 0.1; } }
                .animate-float { animation: float 10s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

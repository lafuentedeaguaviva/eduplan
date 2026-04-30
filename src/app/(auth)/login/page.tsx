'use client';

import { useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLoginController } from '@/hooks/useLoginController';
import { Feedback } from '@/components/ui/feedback';

export default function LoginPage() {
    const router = useRouter();
    const {
        formData,
        loading,
        feedback,
        handleInputChange,
        handleLogin,
        hideFeedback
    } = useLoginController();

    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setGoogleError(null);

        try {
            const redirectTo = `${window.location.origin}/auth/callback`;
            const res = await AuthService.signInWithGoogle(redirectTo);

            if (!res.success) {
                setGoogleError(res.error?.message || 'Proveedor no habilitado o error de red');
                setGoogleLoading(false);
            }
        } catch (err: any) {
            setGoogleError('Error inesperado en el sistema de autenticación');
            setGoogleLoading(false);
        }
    };

    if (feedback.isOpen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-6">
                <Feedback
                    variant={feedback.type}
                    title={feedback.title}
                    description={feedback.description}
                    onClose={hideFeedback}
                    className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#11141b] border-white/10 text-white max-w-sm w-full rounded-[2.5rem]"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0c10] relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white flex items-center justify-center p-6">
            {/* Background Architecture - Ultra Premium Mesh */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full animate-pulse"></div>
                
                <div 
                    className="absolute inset-0 opacity-[0.03]" 
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
                ></div>
            </div>

            <div className="relative z-10 w-full max-w-lg animate-fade-in-up py-12">
                {/* Logo Section */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-[2rem] text-3xl text-white shadow-[0_20px_40px_rgba(37,99,235,0.3)] mb-6 transform hover:scale-110 active:scale-95 transition-all duration-500 cursor-pointer">
                        ✨
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-2 leading-none italic drop-shadow-sm">
                        EduPlan<span className="text-blue-400">Pro</span>
                    </h1>
                </div>

                {/* Glassmorphic Auth Card */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-[4rem] blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
                    
                    <div className="relative bg-[#11141b]/90 backdrop-blur-3xl rounded-[3.5rem] p-10 border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 group-hover:border-white/20">
                        <div className="space-y-8 relative z-10">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                                    Bienvenido de Nuevo
                                </h2>
                                <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
                                    Acceso al ecosistema pedagógico
                                </p>
                            </div>

                            {/* Google Option */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={googleLoading}
                                    className="group/btn relative w-full h-[72px] bg-white hover:bg-slate-50 text-slate-900 font-black rounded-3xl shadow-xl transition-all duration-500 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 overflow-hidden"
                                >
                                    {googleLoading ? (
                                        <div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                                <svg viewBox="0 0 24 24" className="w-5 h-5">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                            </div>
                                            <span className="text-sm">Acceso Directo con Google</span>
                                        </>
                                    )}
                                </button>
                                
                                {googleError && (
                                    <p className="text-[10px] text-rose-400 font-black uppercase text-center tracking-widest animate-shake">
                                        ⚠️ {googleError}
                                    </p>
                                )}
                            </div>

                            {/* Divider */}
                            <div className="relative py-2 text-center">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <span className="relative px-4 bg-[#11141b] text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
                                    o usa tus credenciales
                                </span>
                            </div>

                            {/* Traditional Form */}
                            <form onSubmit={handleLogin} className="space-y-6">
                                <Input
                                    name="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-14 rounded-2xl"
                                    icon={<span className="material-symbols-rounded">mail</span>}
                                />
                                <Input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 h-14 rounded-2xl"
                                    icon={<span className="material-symbols-rounded">key</span>}
                                />
                                
                                <div className="text-right">
                                    <Link href="/forgot-password" size="sm" className="text-[10px] text-blue-400/80 hover:text-blue-400 font-bold uppercase tracking-widest transition-colors">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={loading}
                                    className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 font-black rounded-2xl shadow-xl shadow-white/5"
                                >
                                    ENTRAR AL SISTEMA
                                </Button>
                            </form>

                            {/* Footer Link */}
                            <div className="text-center pt-4">
                                <p className="text-xs text-slate-500 font-medium">
                                    ¿No tienes una cuenta? {' '}
                                    <Link href="/register" className="text-blue-400 font-black hover:underline transition-all">
                                        Regístrate gratis
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Animations */}
            <style jsx global>{`
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                @keyframes pulse-slow { 0%, 100% { opacity: 0.2; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } }
                .animate-float { animation: float 10s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse-slow 12s ease-in-out infinite; }
                .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
}

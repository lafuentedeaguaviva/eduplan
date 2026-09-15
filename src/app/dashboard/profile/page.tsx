'use client';

import { useEffect, useState } from 'react';
import { ProfileService } from '@/services/profile.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProfile } from '@/contexts/ProfileContext';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const { profile: globalProfile, refetchProfile, loading: globalLoading, activeRole, setActiveRole } = useProfile();
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        titulo: '',
        celular: '',
        gemini_api_key: ''
    });

    useEffect(() => {
        if (globalProfile) {
            setFormData({
                nombres: globalProfile.nombres || '',
                apellidos: globalProfile.apellidos || '',
                titulo: globalProfile.titulo || '',
                celular: globalProfile.celular || '',
                gemini_api_key: globalProfile.gemini_api_key || ''
            });
            setIsLoading(false);
        }
    }, [globalProfile]);

    const handleLogout = async () => {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            await AuthService.signOut();
            localStorage.removeItem('eduplan_active_role');
            router.push('/login');
        }
    };

    const handleSwitchRole = () => {
        localStorage.removeItem('eduplan_active_role');
        window.location.reload();
    };

    const handleSave = async () => {
        if (!globalProfile) return;
        setSaveStatus('saving');
        setErrorMessage('');

        try {
            const isComplete = Boolean(
                formData.nombres?.trim() &&
                formData.apellidos?.trim() &&
                formData.titulo?.trim() &&
                formData.celular?.trim()
            );

            const { success, error } = await ProfileService.updateProfile(globalProfile.id, {
                ...formData,
                email: globalProfile.email,
                estado_completitud: isComplete
            });

            if (success) {
                await refetchProfile();
                setSaveStatus('success');
                if (isComplete) {
                    setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
                } else {
                    setTimeout(() => setSaveStatus('idle'), 2500);
                }
            } else {
                setSaveStatus('idle');
                setErrorMessage(error || 'Error desconocido al guardar');
            }
        } catch (error: any) {
            setSaveStatus('idle');
            setErrorMessage(error.message || 'Error crítico en el cliente');
        }
    };

    if (isLoading || globalLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ─── HEADER ─── */}
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">Cuenta</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Mi Perfil</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Personaliza tu información para tus documentos.</p>
                </div>
                <div className="flex gap-2">
                    {(globalProfile?.roles || []).length > 1 && (
                        <Button 
                            variant="outline" 
                            className="border-indigo-200 text-indigo-500 hover:bg-indigo-50 rounded-2xl gap-2 font-black text-xs uppercase tracking-widest"
                            onClick={handleSwitchRole}
                        >
                            <span className="material-symbols-rounded text-lg font-black">sync_alt</span>
                            Cambiar Rol
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        className="border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl gap-2 font-black text-xs uppercase tracking-widest"
                        onClick={handleLogout}
                    >
                        <span className="material-symbols-rounded text-lg">logout</span>
                        Cerrar Sesión
                    </Button>
                </div>
            </div>

            {/* ─── PROFILE CARD ─── */}
            <div className="bg-white rounded-[2.5rem] shadow-premium border border-slate-100/80 overflow-hidden">

                {/* Hero Banner */}
                <div className="h-44 bento-gradient-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-900/30 to-transparent" />
                    {/* Decorative circles */}
                    <div className="absolute top-4 right-12 size-24 bg-white/5 rounded-full" />
                    <div className="absolute -bottom-8 right-8 size-40 bg-white/5 rounded-full" />
                </div>

                <div className="px-10 pb-10 relative">
                    {/* Avatar */}
                    <div className="flex flex-col items-center -mt-16 mb-10">
                        <div className="relative group cursor-pointer">
                            <div className="size-32 rounded-[2rem] border-[5px] border-white bg-slate-100 shadow-xl overflow-hidden transition-all group-hover:shadow-2xl group-hover:scale-105">
                                <img
                                    src={globalProfile?.foto_url || `https://api.dicebear.com/9.x/avataaars/svg?seed=${formData.nombres || 'User'}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-xl shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                                <span className="material-symbols-rounded text-sm font-black block">photo_camera</span>
                            </div>
                        </div>

                        <div className="mt-5 text-center">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {formData.nombres || 'Usuario'} {formData.apellidos}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm mt-0.5">{globalProfile?.email}</p>

                            <div className="flex gap-2 justify-center mt-3">
                                {globalProfile?.roles?.map((role: string) => (
                                    <span key={role} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section Label */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <span className="material-symbols-rounded text-lg font-black">badge</span>
                        </div>
                        <span className="font-black text-slate-800 tracking-tight">Información Personal</span>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="soft-label">Email (No editable)</label>
                            <Input
                                value={globalProfile?.email || ''}
                                readOnly
                                disabled
                                className="bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed h-12 rounded-2xl"
                            />
                        </div>

                        {[
                            { key: 'nombres', label: 'Nombres', placeholder: 'Tu nombre' },
                            { key: 'apellidos', label: 'Apellidos', placeholder: 'Tu apellido' },
                            { key: 'titulo', label: 'Título Profesional', placeholder: 'Ej: Lic., Prof., Ing.' },
                            { key: 'celular', label: 'Celular', placeholder: '+591 ...' },
                        ].map(field => (
                            <div key={field.key} className="space-y-1.5">
                                <label className="soft-label">{field.label}</label>
                                <Input
                                    value={formData[field.key as keyof typeof formData]}
                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                    placeholder={field.placeholder}
                                    className="bg-slate-50/80 border-slate-200 focus:bg-white h-12 rounded-2xl"
                                />
                            </div>
                        ))}


                    </div>

                    {/* Error */}
                    {errorMessage && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-bottom-2">
                            <span className="material-symbols-rounded mt-0.5 font-black shrink-0">error</span>
                            <div>
                                <p className="font-black text-sm">No se pudo guardar</p>
                                <p className="text-xs font-medium opacity-80 mt-0.5">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-end gap-3">
                        <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl"
                            disabled={saveStatus !== 'idle'}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className={`min-w-[160px] h-12 rounded-2xl font-black text-sm transition-all duration-300 ${saveStatus === 'success'
                                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                                    : 'shadow-lg shadow-slate-900/20 hover:scale-105'
                                }`}
                            onClick={handleSave}
                            isLoading={saveStatus === 'saving'}
                            disabled={saveStatus !== 'idle'}
                        >
                            {saveStatus === 'saving' ? 'Guardando...' :
                                saveStatus === 'success' ? (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-rounded font-black">check</span>
                                        ¡Guardado!
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-rounded text-lg font-black">save</span>
                                        Guardar Cambios
                                    </span>
                                )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

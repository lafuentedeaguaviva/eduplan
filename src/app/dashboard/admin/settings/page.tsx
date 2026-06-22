'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const router = useRouter();
    const { 
        settings, 
        loadGlobalSettings, 
        saveGlobalSettings, 
        checkAccess, 
        loading, 
        saving 
    } = useAdminController();
    
    // Local form state
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        checkAccess();
        loadGlobalSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleSave = async () => {
        if (!formData) return;
        const success = await saveGlobalSettings(formData);
        if (success) {
            toast.success("Configuración Sincronizada", {
                description: "Los cambios se han guardado en la base de datos."
            });
        }
    };

    if (loading && !formData) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/admin')} className="size-12 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group">
                        <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all">arrow_back</span>
                    </button>
                    <div>
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-rose-600 bg-rose-50 border-rose-100 mb-2">
                           System Core Configuration
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Ajustes del Sistema</h1>
                    </div>
                </div>
                
                <Button 
                    onClick={handleSave}
                    isLoading={saving}
                    className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black shadow-2xl shadow-slate-200"
                >
                    Guardar Cambios
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Main Settings */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="p-10 border-none shadow-premium bg-white">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900">
                                <span className="material-symbols-rounded text-3xl">calendar_today</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Ciclo Académico</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Temporalidad del sistema</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Gestión Actual (Año)</label>
                                <select 
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black text-slate-900 outline-none focus:border-slate-900 transition-all"
                                    value={formData?.gestion_actual}
                                    onChange={(e) => setFormData({...formData, gestion_actual: parseInt(e.target.value)})}
                                >
                                    {[2024, 2025, 2026, 2027].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trimestre en Curso</label>
                                <select 
                                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-black text-slate-900 outline-none focus:border-slate-900 transition-all"
                                    value={formData?.trimestre_actual}
                                    onChange={(e) => setFormData({...formData, trimestre_actual: parseInt(e.target.value)})}
                                >
                                    <option value={1}>Primer Trimestre</option>
                                    <option value={2}>Segundo Trimestre</option>
                                    <option value={3}>Tercer Trimestre</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 border-none shadow-premium bg-white">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <span className="material-symbols-rounded text-3xl">auto_awesome</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Inteligencia Artificial</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cuotas y límites de consumo</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Límite Diario por Usuario (Tokens/Solicitudes)</label>
                                    <span className="text-lg font-black text-indigo-600">{formData?.ia_limit_per_user}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="100" 
                                    max="5000" 
                                    step="100"
                                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    value={formData?.ia_limit_per_user || 1500}
                                    onChange={(e) => setFormData({...formData, ia_limit_per_user: parseInt(e.target.value)})}
                                />
                                <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                    <span>100 (Restringido)</span>
                                    <span>5000 (Ilimitado)</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Col: Toggles & Security */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-8 border-none shadow-premium bg-slate-900 text-white">
                        <h3 className="text-lg font-black tracking-tight mb-8">Estado del Sistema</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div>
                                    <p className="font-bold text-sm">Modo Mantenimiento</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Bloquea el acceso a todos los usuarios.</p>
                                </div>
                                <button 
                                    onClick={() => setFormData({...formData, maintenance_mode: !formData.maintenance_mode})}
                                    className={`size-12 rounded-xl flex items-center justify-center transition-all ${formData?.maintenance_mode ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                                >
                                    <span className="material-symbols-rounded">{formData?.maintenance_mode ? 'toggle_on' : 'toggle_off'}</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                <div>
                                    <p className="font-bold text-sm">Registro de Usuarios</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Permite nuevas altas en el sistema.</p>
                                </div>
                                <button 
                                    onClick={() => setFormData({...formData, allow_registration: !formData.allow_registration})}
                                    className={`size-12 rounded-xl flex items-center justify-center transition-all ${formData?.allow_registration ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}
                                >
                                    <span className="material-symbols-rounded">{formData?.allow_registration ? 'toggle_on' : 'toggle_off'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-10 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold leading-relaxed">
                            <span className="material-symbols-rounded text-sm align-middle mr-2">warning</span>
                            Los cambios en estas opciones pueden desconectar a usuarios activos o impedir el acceso a la plataforma. Procede con cautela.
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

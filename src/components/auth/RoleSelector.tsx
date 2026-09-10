'use client';

import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap, Settings, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RoleSelector() {
    const { profile, activeRole, setActiveRole } = useProfile();
    const router = useRouter();

    // Si el usuario ya tiene un rol activo o no ha cargado el perfil, no mostramos nada
    if (!profile || activeRole || (profile.roles || []).length <= 1) {
        return null;
    }

    const roles = [
        {
            id: 'Profesor',
            label: 'Docente',
            description: 'Gestiona tus PDCs, bibliotecas y actividades pedagógicas.',
            icon: GraduationCap,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
            border: 'border-indigo-100',
            shadow: 'shadow-indigo-500/10'
        },
        {
            id: 'Director',
            label: 'Director',
            description: 'Supervisa y valida las planificaciones de tu unidad educativa.',
            icon: ShieldCheck,
            color: 'text-sky-500',
            bg: 'bg-sky-50',
            border: 'border-sky-100',
            shadow: 'shadow-sky-500/10'
        },
        {
            id: 'Administrador',
            label: 'Administrador',
            description: 'Acceso total al sistema, catálogos y gestión de usuarios.',
            icon: Settings,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            shadow: 'shadow-rose-500/10'
        },
        {
            id: 'Secretario',
            label: 'Secretario',
            description: 'Gestión de recursos institucionales, normativas y bienes.',
            icon: Settings, // Puedes cambiar el icono si prefieres
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            shadow: 'shadow-emerald-500/10'
        }
    ].filter(r => profile.roles?.includes(r.id));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
            {/* Fondo con decoración ambiental */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] size-[500px] bg-indigo-50/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-sky-50/50 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-5xl px-6 py-12 space-y-12">
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200"
                    >
                        Selección de Acceso
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter"
                    >
                        Bienvenido, {profile.nombres}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 font-medium max-w-lg mx-auto"
                    >
                        Detectamos múltiples roles asociados a tu cuenta. 
                        Por favor, selecciona con qué perfil deseas trabajar hoy.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {roles.map((role, idx) => (
                        <motion.button
                            key={role.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                            onClick={() => {
                                setActiveRole(role.id);
                                // Forzar navegación inmediata según el rol para cambiar la pantalla central
                                setTimeout(() => {
                                    if (role.id === 'Administrador') {
                                        router.push('/dashboard/admin');
                                    } else if (role.id === 'Director') {
                                        router.push('/dashboard/director');
                                    } else {
                                        router.push('/dashboard');
                                    }
                                }, 50);
                            }}
                            className={cn(
                                "group relative flex flex-col items-start p-8 rounded-[3rem] border bg-white transition-all duration-500 text-left overflow-hidden",
                                role.border,
                                "hover:shadow-2xl hover:-translate-y-2",
                                role.shadow
                            )}
                        >
                            {/* Ambient internal light */}
                            <div className={cn(
                                "absolute -top-10 -right-10 size-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity",
                                role.bg
                            )} />

                            <div className={cn(
                                "size-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500",
                                role.bg,
                                role.color
                            )}>
                                <role.icon className="size-8" />
                            </div>

                            <div className="space-y-2 relative z-10">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{role.label}</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                    {role.description}
                                </p>
                            </div>

                            <div className={cn(
                                "mt-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                                role.color
                            )}>
                                Entrar como {role.label}
                                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.button>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center pt-8"
                >
                    <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.2em]">
                        EduPlan Pro v2.0 • Gestión Multi-Rol Activada
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

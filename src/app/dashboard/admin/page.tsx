'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useAdminController } from '@/hooks/useAdminController';
import { AdminService } from '@/services/admin.service';

export default function AdminDashboardPage() {
    const { checkAccess } = useAdminController();
    const [stats, setStats] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                const res = await AdminService.getSystemStats();
                if (res.success) setStats(res.data);
                setLoading(false);
            }
        };
        init();
    }, []);

    const statCards = [
        { label: 'PDCs Generados', value: stats?.totalPDCs || '0', icon: 'description', color: 'blue' },
        { label: 'Unidades Educativas', value: stats?.totalUnits || '0', icon: 'school', color: 'emerald' },
        { label: 'Docentes Activos', value: stats?.totalUsers || '0', icon: 'group', color: 'indigo' },
        { label: 'Contenidos Base', value: '890', icon: 'menu_book', color: 'purple' }, // Static for now as it's not in the stats API yet
    ];

    const adminModules = [
        {
            title: 'Gestión Curricular',
            description: 'Administra niveles, grados, áreas y contenidos base del sistema educativo.',
            icon: 'account_tree',
            href: '/dashboard/admin/curriculum',
            color: 'blue',
            badge: 'Core'
        },
        {
            title: 'Bibliotecas Pedagógicas',
            description: 'Gestiona ejemplos de práctica, teoría, producción y valoración para el asistente IA.',
            icon: 'library_books',
            href: '/dashboard/admin/libraries',
            color: 'indigo',
            badge: 'IA Data'
        },
        {
            title: 'Geografía y Sedes',
            description: 'Configura departamentos, distritos y unidades educativas registradas.',
            icon: 'map',
            href: '/dashboard/admin/geo',
            color: 'emerald',
            badge: 'Geo'
        },
        {
            title: 'Usuarios y Permisos',
            description: 'Asigna roles de Director y Administrador a los perfiles del sistema.',
            icon: 'admin_panel_settings',
            href: '/dashboard/admin/users',
            color: 'orange',
            badge: 'Security'
        }
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-purple-600 bg-purple-50 border-purple-100 mb-2">
                        Administración del Sistema
                    </Badge>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                        Panel de Control Maestro
                    </h1>
                    <p className="text-slate-500 font-medium max-w-xl">
                        Bienvenido al núcleo de EduPlan Pro. Desde aquí puedes orquestar toda la estructura académica y pedagógica de la plataforma.
                    </p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(stats || statCards).map((stat: any, i: number) => (
                    <Card key={i} className="p-6 border-none shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110`}>
                            <span className="material-symbols-rounded text-6xl text-slate-900">{stat.icon}</span>
                        </div>
                        <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</span>
                        </div>
                        <div className={`mt-4 h-1.5 w-12 rounded-full bg-${stat.color}-500/20`} />
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {adminModules.map((module, i) => (
                    <Link key={i} href={module.href}>
                        <Card className="p-8 border-none shadow-soft hover:shadow-premium transition-all duration-500 group cursor-pointer h-full relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 group-hover:bg-blue-50 transition-colors duration-500" />
                            
                            <div className="relative z-10">
                                <div className={`size-14 rounded-2xl bg-${module.color}-50 flex items-center justify-center text-${module.color}-600 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                    <span className="material-symbols-rounded text-3xl font-black">{module.icon}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{module.title}</h3>
                                        <Badge className="font-black text-[9px] uppercase tracking-widest">{module.badge}</Badge>
                                    </div>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        {module.description}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-2 text-sm font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                                <span>Acceder al módulo</span>
                                <span className="material-symbols-rounded text-base animate-pulse">arrow_forward</span>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions Footer */}
            <Card className="p-10 border-none bg-slate-900 text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tight">Acciones Rápidas</h2>
                        <p className="text-slate-400 text-lg">Mantenimiento y soporte técnico del sistema.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 h-12 rounded-2xl font-black gap-2">
                            <span className="material-symbols-rounded text-xl">database</span>
                            Respaldo BD
                        </Button>
                        <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 h-12 rounded-2xl font-black gap-2">
                            <span className="material-symbols-rounded text-xl">terminal</span>
                            Ver Logs
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 rounded-2xl font-black gap-2 shadow-lg shadow-blue-500/40">
                            <span className="material-symbols-rounded text-xl">help</span>
                            Soporte
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

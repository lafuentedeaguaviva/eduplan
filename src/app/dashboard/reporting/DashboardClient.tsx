/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { exportToWord, exportToExcel } from '@/lib/exportService';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function DashboardClient({ initialStats, initialPdcs, userEmail }: { initialStats: any, initialPdcs: any[], userEmail?: string }) {
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Mesh Gradients & Patterns */}
            <div className="absolute inset-0 bg-dot-pattern opacity-[0.15] pointer-events-none"></div>
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[120px] rounded-full animate-float"></div>
            <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-400/10 blur-[120px] rounded-full"></div>

            <div className="relative z-10 p-8 max-w-[1600px] mx-auto animate-fade-in-up">
                <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="w-10 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">EduPlan Pro v1.0</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight text-slate-900 font-display leading-[0.9]">
                            Panel de <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">Consulta</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg max-w-xl">
                            Visualización avanzada de datos curriculares y gestión de reportes en tiempo real.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                        <div className="glass-premium px-6 py-3 rounded-2xl flex items-center gap-3 shadow-luxe group hover:border-blue-300 transition-all duration-500">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                                Admin: <span className="text-blue-600 lowercase font-bold">{userEmail}</span>
                            </span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-xs font-black text-slate-400 hover:text-red-500 transition-all duration-300 flex items-center gap-2 group tracking-widest uppercase px-4 py-2 hover:bg-red-50 rounded-xl"
                        >
                            <span className="group-hover:rotate-12 transition-transform">🚪</span> Salir del Sistema
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <StatCard title="Total PDCs" value={initialStats.totalPdcs} icon="📄" color="from-blue-500 to-blue-600" delay="0" />
                    <StatCard title="Docentes" value={initialStats.totalProfiles} icon="👤" color="from-indigo-500 to-indigo-600" delay="100" />
                    <StatCard title="U. Educativas" value={initialStats.totalUE} icon="🏫" color="from-cyan-500 to-blue-500" delay="200" />
                </div>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    <div className="lg:col-span-2 glass-premium rounded-[2.5rem] p-10 shadow-luxe border-white/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-900 tracking-tight">
                            <span className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-2xl text-blue-600 text-xl shadow-inner-white">📝</span>
                            PDCs Disponibles en Sistema
                        </h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-2">
                                <thead>
                                    <tr>
                                        <th className="pb-4 px-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Nombre del Reporte</th>
                                        <th className="pb-4 px-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Periodo</th>
                                        <th className="pb-4 px-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Docente Responsable</th>
                                        <th className="pb-4 px-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">Estado</th>
                                        <th className="pb-4 px-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600">
                                    {initialPdcs && initialPdcs.length > 0 ? initialPdcs.map((pdc, idx) => (
                                        <tr key={pdc.id} className="group/row transition-all duration-500">
                                            <td className="py-5 px-6 bg-white/40 group-hover/row:bg-white/80 rounded-l-2xl border-y border-l border-slate-100/50 group-hover/row:border-blue-100 transition-all font-black text-slate-900 text-sm tracking-tight">
                                                {pdc.nombre_pdc || 'Sin Nombre'}
                                            </td>
                                            <td className="py-5 px-4 bg-white/40 group-hover/row:bg-white/80 border-y border-slate-100/50 group-hover/row:border-blue-100 transition-all text-xs font-bold text-slate-500">
                                                {pdc.gestion} • T{pdc.trimestre}
                                            </td>
                                            <td className="py-5 px-4 bg-white/40 group-hover/row:bg-white/80 border-y border-slate-100/50 group-hover/row:border-blue-100 transition-all text-xs font-medium text-slate-500">
                                                {pdc.perfiles?.nombres} {pdc.perfiles?.apellidos}
                                            </td>
                                            <td className="py-5 px-4 bg-white/40 group-hover/row:bg-white/80 border-y border-slate-100/50 group-hover/row:border-blue-100 transition-all">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                                                    pdc.estado === 'Verificado' 
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                    {pdc.estado}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 bg-white/40 group-hover/row:bg-white/80 rounded-r-2xl border-y border-r border-slate-100/50 group-hover/row:border-blue-100 transition-all text-right">
                                                <Link 
                                                    href={`/dashboard/reporting/viewer/${pdc.id}`}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20 inline-block"
                                                >
                                                    Explorar
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center text-slate-400 font-bold italic border border-dashed border-slate-200 rounded-2xl">
                                                No se encontraron registros activos en la base de datos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="glass-premium rounded-[2.5rem] p-8 shadow-luxe border-white/50 relative overflow-hidden group">
                            <h2 className="text-xl font-black mb-8 flex items-center gap-4 text-slate-900 tracking-tight">
                                <span className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-xl text-purple-600 text-lg shadow-inner-white">⚡</span>
                                Herramientas Rápidas
                            </h2>
                            <div className="space-y-4">
                                <ActionButton 
                                    label="Exportar Base de Datos (Excel)" 
                                    icon="📊" 
                                    onClick={() => exportToExcel(initialPdcs, 'Reporte_Global_PDCs')}
                                />
                                <ActionButton 
                                    label="Dossier Administrativo (Word)" 
                                    icon="📄" 
                                    onClick={() => initialPdcs.length > 0 && exportToWord(initialPdcs[0])}
                                />
                                <ActionButton label="Métricas de Docencia" icon="📈" />
                                <ActionButton label="Mapeo de Cobertura" icon="🗺️" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-luxe relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                            <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Soporte Técnico</h3>
                            <p className="text-blue-100 text-sm mb-6 font-medium leading-relaxed">¿Necesitas ayuda con los reportes o la integración de datos?</p>
                            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]">
                                Contactar Administrador
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, delay }: { title: string; value: number; icon: string; color: string; delay: string }) {
    return (
        <div 
            className="glass-premium rounded-[2.5rem] p-8 border-white/50 hover:border-blue-400 transition-all duration-500 group shadow-luxe hover:-translate-y-2 relative overflow-hidden"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute -bottom-4 -right-4 text-8xl opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">{icon}</div>
            <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full bg-blue-100 group-hover:bg-blue-400 transition-colors delay-${i*100}`}></div>
                    ))}
                </div>
            </div>
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">{title}</h3>
            <p className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
        </div>
    );
}

function ActionButton({ label, icon, onClick }: { label: string; icon: string; onClick?: () => void }) {
    return (
        <button 
            onClick={onClick}
            className="w-full flex items-center gap-5 p-5 bg-white/40 hover:bg-white rounded-2xl border border-slate-100/50 hover:border-blue-200 transition-all group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-2 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-all translate-x-full group-hover:translate-x-0"></div>
            <span className="text-2xl group-hover:scale-110 transition-transform group-hover:bg-blue-50 p-2 rounded-xl">{icon}</span>
            <span className="text-[12px] font-black text-slate-600 group-hover:text-blue-600 uppercase tracking-widest">{label}</span>
        </button>
    );
}

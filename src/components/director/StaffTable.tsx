'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface StaffTableProps {
    staff: any[];
}

export function StaffTable({ staff }: StaffTableProps) {
    return (
        <Card className="p-0 border-none shadow-premium bg-white overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Seguimiento de Plantel Docente</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Audit de Desempeño Pedagógico</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-rounded text-slate-300">person_search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar docente..." 
                        className="bg-slate-50 border-none rounded-xl text-xs p-3 w-48 font-bold text-slate-600 outline-none"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                            <th className="p-6">Maestro/a</th>
                            <th className="p-6">Estado Ejecución</th>
                            <th className="p-6">Contenidos</th>
                            <th className="p-6 text-right">Eficiencia</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {staff.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-300 italic font-medium">No se encontraron docentes asociados a esta unidad.</td>
                            </tr>
                        ) : (
                            staff.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                                <img 
                                                    src={teacher.foto || `https://api.dicebear.com/9.x/avataaars/svg?seed=${teacher.nombre}`} 
                                                    alt={teacher.nombre}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors uppercase">{teacher.nombre}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Normal Docente</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 w-1/3">
                                        <div className="space-y-1.5 flex flex-col items-end">
                                            <div className="flex justify-between w-full text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                                <span>Progreso Real</span>
                                                <span className={teacher.executionRate > 70 ? 'text-emerald-500' : 'text-amber-500'}>{teacher.executionRate}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${teacher.executionRate > 70 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-amber-400'}`}
                                                    style={{ width: `${teacher.executionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-black text-slate-700">{teacher.completedContents} / {teacher.totalContents}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">Unidades Semanales</p>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        <Badge 
                                            variant="outline" 
                                            className={`font-black text-[10px] uppercase border-2 ${
                                                teacher.executionRate > 80 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                                                teacher.executionRate > 50 ? 'bg-blue-50 border-blue-100 text-blue-600' : 
                                                'bg-rose-50 border-rose-100 text-rose-600'
                                            }`}
                                        >
                                            {teacher.executionRate > 80 ? 'Excelente' : teacher.executionRate > 50 ? 'Estable' : 'Critico'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

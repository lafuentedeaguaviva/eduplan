'use client';

import React from 'react';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function DataReferential() {
    const {
        selectedType,
        mainAreaDetails,
        userProfile,
        selectedTrimestre,
        selectedMes,
        pdcDates
    } = usePdcWizard();

    const typeConfig = {
        1: { color: 'rose', text: 'Inicial', icon: 'child_care' },
        2: { color: 'amber', text: 'Primaria', icon: 'school' },
        3: { color: 'indigo', text: 'Secundaria', icon: 'menu_book' },
        4: { color: 'emerald', text: 'Multigrado', icon: 'group_work' },
    }[selectedType || 2] || { color: 'slate', text: 'Desconocido', icon: 'help' };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '---';
        try {
            return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const InfoRow = ({ label, value, icon, colSpan = false, highlight = false }: { label: string, value: React.ReactNode, icon: string, colSpan?: boolean, highlight?: boolean }) => (
        <div className={`${colSpan ? 'col-span-full' : 'col-span-1'} p-6 rounded-[1.5rem] border border-slate-100 bg-white transition-all hover:shadow-md group/row ${highlight ? `bg-${typeConfig.color}-50/30 border-${typeConfig.color}-100/50` : ''}`}>
            <div className="flex items-start gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-transform group-hover/row:scale-110 ${highlight ? `bg-${typeConfig.color}-100 text-${typeConfig.color}-600` : 'bg-slate-100 text-slate-400'}`}>
                    <span className="material-symbols-rounded text-xl">{icon}</span>
                </div>
                <div className="space-y-1 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className={`text-base font-black tracking-tight ${highlight ? `text-${typeConfig.color}-900` : 'text-slate-800'}`}>
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="flex flex-col gap-2">
                <Badge variant="outline" className={`w-fit font-black uppercase tracking-[0.2em] text-[10px] text-${typeConfig.color}-600 bg-${typeConfig.color}-50 border-${typeConfig.color}-100`}>
                    Paso 4: Datos Referenciales del PDC
                </Badge>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                    Información del Área de Trabajo
                </h1>
                <p className="text-slate-500 font-medium">Verifica la coherencia de los datos institucionales antes de avanzar con el diseño pedagógico.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                    label="Distrito Educativo"
                    value={
                        (Array.isArray(mainAreaDetails?.unidad_educativa?.distrito)
                            ? (mainAreaDetails?.unidad_educativa?.distrito as any)[0]?.nombre
                            : (mainAreaDetails?.unidad_educativa?.distrito as any)?.nombre) || 'S/N'
                    }
                    icon="location_on"
                />
                <InfoRow
                    label="Unidad Educativa"
                    value={mainAreaDetails?.unidad_educativa?.nombre || 'S/N'}
                    icon="domain"
                />
                <InfoRow
                    label="Nivel y Ciclo"
                    value={
                        <div className="flex items-center gap-2">
                            <span className={`size-2 rounded-full bg-${typeConfig.color}-500 shadow-[0_0_8px_rgba(0,0,0,0.1)] animate-pulse`} />
                            {typeConfig.text}
                        </div>
                    }
                    icon="stars"
                />
                <InfoRow
                    label="Grado y Paralelos"
                    value={
                        <div className="flex flex-wrap gap-1.5">
                            {(mainAreaDetails?.area_conocimiento as any)?.grado?.nombre}
                            {mainAreaDetails?.paralelos?.map(p => (
                                <Badge key={p.id} variant="default" className="bg-slate-100 text-slate-600 font-black border-none rounded-lg">
                                    "{p.nombre}"
                                </Badge>
                            ))}
                        </div>
                    }
                    icon="groups"
                />
                <InfoRow
                    label="Maestra/o Responsable"
                    value={userProfile?.nombre_completo || 'Cargando...'}
                    icon="person"
                    colSpan
                />
                <InfoRow
                    label="Área de Conocimiento Principal"
                    value={mainAreaDetails?.area_conocimiento?.nombre || '---'}
                    icon="menu_book"
                    colSpan
                    highlight
                />

                <div className="col-span-full mt-4 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-[2rem] bg-white shadow-premium flex items-center justify-center text-slate-400">
                            <span className="material-symbols-rounded text-3xl">calendar_month</span>
                        </div>
                        <div className="space-y-1">
                            <Badge variant="default" className="bg-slate-900 text-white font-black tracking-widest px-3">
                                {selectedTrimestre === 1 ? 'PRIMER TRIMESTRE' : selectedTrimestre === 2 ? 'SEGUNDO TRIMESTRE' : 'TERCER TRIMESTRE'}
                            </Badge>
                            <p className="text-xl font-black text-slate-800 tracking-tight">Periodo de Ejecución Vigente</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mes Planificado</div>
                                <div className="text-xl font-black text-slate-900 tracking-tighter">MES {selectedMes || '---'}</div>
                            </div>
                            <div className="h-8 w-px bg-slate-100" />
                            <div className="flex flex-col md:items-end">
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                                    <span className="material-symbols-rounded text-xs">schedule</span>
                                    Vigencia
                                </div>
                                <p className="text-sm font-black text-blue-600 tracking-tighter bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                    {formatDate(pdcDates.inicio)} al {formatDate(pdcDates.fin)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


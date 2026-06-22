'use client';

import { useState, useMemo, useEffect } from 'react';
import { PdcService } from '@/services/pdc.service';
import { PlanificacionGeneral, PlanificacionSemanal } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
    areaId: string;
    gestion: number;
    trimestre: number;
    globalSchedule: PlanificacionGeneral[];
    onClose: () => void;
    onSuccess: (t: number) => void;
}

export function ScheduleConfigModal({ areaId, gestion, trimestre, globalSchedule, onClose, onSuccess }: Props) {
    const [isSaving, setIsSaving] = useState(false);
    const [localTrimestre, setLocalTrimestre] = useState(trimestre);
    const [localGlobalSchedule, setLocalGlobalSchedule] = useState<PlanificacionGeneral[]>(globalSchedule);

    // 1. Initialize local state from global schedule
    const [previewWeeks, setPreviewWeeks] = useState<Partial<PlanificacionSemanal>[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedWeeks, setSelectedWeeks] = useState<Set<string>>(new Set());

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSchedules = async () => {
            setIsLoading(true);

            // 1. Fetch Global Schedule for this trimester
            let currentGlobal = globalSchedule;
            if (localTrimestre !== trimestre) {
                const resGlobal = await PdcService.getGlobalSchedule(gestion, localTrimestre);
                if (resGlobal.success && resGlobal.data) {
                    currentGlobal = resGlobal.data;
                }
            }
            setLocalGlobalSchedule(currentGlobal);

            // 2. Fetch Area Schedule for this trimester
            const resArea = await PdcService.getAreaSchedule(areaId, gestion, localTrimestre);
            const areaWeeks = resArea.success && resArea.data ? resArea.data : [];

            if (areaWeeks.length > 0) {
                // If the user has already configured this area, load it
                setPreviewWeeks(areaWeeks);
                setStartDate(areaWeeks[0].fecha_inicio_trimestre || currentGlobal[0]?.fecha_inicio_trimestre || '');
                setEndDate(areaWeeks[0].fecha_fin_trimestre || currentGlobal[0]?.fecha_fin_trimestre || '');
                setSelectedWeeks(new Set(areaWeeks.map(w => `${w.mes}-${w.semana}`)));
            } else if (currentGlobal && currentGlobal.length > 0) {
                // Otherwise fallback to global schedule
                const initialWeeks = currentGlobal.map(w => ({
                    area_trabajo_id: areaId,
                    gestion,
                    trimestre: localTrimestre,
                    mes: w.mes,
                    semana: w.semana,
                    fecha_inicio_trimestre: w.fecha_inicio_trimestre,
                    fecha_fin_trimestre: w.fecha_fin_trimestre
                }));
                setPreviewWeeks(initialWeeks);
                setStartDate(currentGlobal[0].fecha_inicio_trimestre);
                setEndDate(currentGlobal[0].fecha_fin_trimestre);
                setSelectedWeeks(new Set(initialWeeks.map(w => `${w.mes}-${w.semana}`)));
            } else {
                setPreviewWeeks([]);
                setStartDate('');
                setEndDate('');
                setSelectedWeeks(new Set());
            }

            setIsLoading(false);
        };
        fetchSchedules();
    }, [localTrimestre, trimestre, globalSchedule, gestion, areaId]);

    // Update dates in all weeks when trimester dates change
    useEffect(() => {
        setPreviewWeeks(prev => prev.map(w => ({
            ...w,
            fecha_inicio_trimestre: startDate,
            fecha_fin_trimestre: endDate
        })));
    }, [startDate, endDate]);

    const handleReset = () => {
        if (localGlobalSchedule && localGlobalSchedule.length > 0) {
            const initialWeeks = localGlobalSchedule.map(w => ({
                area_trabajo_id: areaId,
                gestion,
                trimestre: localTrimestre,
                mes: w.mes,
                semana: w.semana,
                fecha_inicio_trimestre: w.fecha_inicio_trimestre,
                fecha_fin_trimestre: w.fecha_fin_trimestre
            }));
            setPreviewWeeks(initialWeeks);
            setStartDate(localGlobalSchedule[0].fecha_inicio_trimestre);
            setEndDate(localGlobalSchedule[0].fecha_fin_trimestre);
            setSelectedWeeks(new Set(initialWeeks.map(w => `${w.mes}-${w.semana}`)));
        }
    };

    const toggleWeek = (mes: number, semana: number) => {
        const key = `${mes}-${semana}`;
        const next = new Set(selectedWeeks);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedWeeks(next);
    };

    const addWeekToMonth = (mes: number) => {
        const monthWeeks = previewWeeks.filter(w => w.mes === mes);
        const nextSemana = monthWeeks.length + 1;
        if (nextSemana > 5) return; // Limite razonable

        const newWeek: Partial<PlanificacionSemanal> = {
            area_trabajo_id: areaId,
            gestion,
            trimestre: localTrimestre,
            mes,
            semana: nextSemana,
            fecha_inicio_trimestre: startDate,
            fecha_fin_trimestre: endDate
        };

        setPreviewWeeks(prev => [...prev, newWeek]);
        setSelectedWeeks(prev => new Set(prev).add(`${mes}-${nextSemana}`));
    };

    const removeLastWeekFromMonth = (mes: number) => {
        const monthWeeks = previewWeeks.filter(w => w.mes === mes);
        if (monthWeeks.length === 0) return;
        
        const lastSemana = monthWeeks[monthWeeks.length - 1].semana;
        setPreviewWeeks(prev => {
            const index = prev.findLastIndex(w => w.mes === mes && w.semana === lastSemana);
            if (index === -1) return prev;
            const next = [...prev];
            next.splice(index, 1);
            return next;
        });
        setSelectedWeeks(prev => {
            const next = new Set(prev);
            next.delete(`${mes}-${lastSemana}`);
            return next;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Clear existing for this area/trimester
            const resDel = await PdcService.deleteAreaSchedule(areaId, gestion, localTrimestre);
            if (!resDel.success) {
                alert('Error al limpiar el cronograma previo: ' + resDel.error?.message);
                setIsSaving(false);
                return;
            }

            // 2. Create only selected weeks
            const weeksToCreate = previewWeeks.filter(w =>
                selectedWeeks.has(`${w.mes}-${w.semana}`)
            ).map(w => {
                const { semana_contenido, ...cleanWeek } = w as any;
                return cleanWeek as PlanificacionSemanal;
            });

            if (weeksToCreate.length === 0) {
                alert('Selecciona al menos una semana');
                setIsSaving(false);
                return;
            }

            const result = await PdcService.createAreaSchedule(weeksToCreate);
            if (result.success) {
                onSuccess(localTrimestre);
            } else {
                alert('Error al guardar el cronograma: ' + result.error?.message);
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Group preview weeks by month for display
    const groupedMonths = useMemo(() => {
        const grouped: Record<number, any[]> = {};
        previewWeeks.forEach(week => {
            if (!grouped[week.mes!]) grouped[week.mes!] = [];
            grouped[week.mes!].push(week);
        });
        return grouped;
    }, [previewWeeks]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-blue-50/30">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Preparar Calendario 2026</h2>
                        <div className="flex bg-white/50 p-1 rounded-xl border border-blue-100 mt-2">
                            {[1, 2, 3].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => !isSaving && setLocalTrimestre(t)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${localTrimestre === t
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {t}º TRIMESTRE
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center">
                        <span className="material-symbols-rounded text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-8 max-h-[65vh] overflow-y-auto space-y-8">
                    {/* Controls (Admin style) */}
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Límites del {localTrimestre}º Trimestre</label>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[9px] font-black text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg"
                                onClick={handleReset}
                            >
                                REINICIAR A SUGERIDO
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Inicio del Trimestre</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="font-bold h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Fin del Trimestre</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="font-bold h-11"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3">
                            <span className="material-symbols-rounded text-blue-600 text-lg">info</span>
                            <p className="text-[10px] font-medium text-blue-700 leading-relaxed">
                                Las fechas editadas arriba se aplicarán a todas las semanas seleccionadas para este área. 
                                Puedes desmarcar semanas individuales en la lista de abajo si no son laborables.
                            </p>
                        </div>
                    </div>

                    {/* Preview List */}
                    <div className="space-y-8">
                        {Object.entries(groupedMonths).map(([mes, weeks]) => (
                            <div key={mes} className="space-y-4">
                                <div className="flex items-center justify-between mb-2 pr-2">
                                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest pl-1">
                                        MES {mes}
                                    </h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => removeLastWeekFromMonth(Number(mes))}
                                            className="w-6 h-6 rounded-md bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                                            title="Quitar última semana"
                                        >
                                            <span className="material-symbols-rounded text-base">remove</span>
                                        </button>
                                        <button 
                                            onClick={() => addWeekToMonth(Number(mes))}
                                            className="w-6 h-6 rounded-md bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center"
                                            title="Añadir semana"
                                        >
                                            <span className="material-symbols-rounded text-base">add</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {weeks.map(week => {
                                        const isSelected = selectedWeeks.has(`${week.mes}-${week.semana}`);
                                        return (
                                            <div
                                                key={`${week.mes}-${week.semana}`}
                                                onClick={() => toggleWeek(week.mes!, week.semana!)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${isSelected
                                                    ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                                                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50 opacity-60'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 shadow-sm'
                                                        }`}>
                                                        {week.semana}
                                                    </div>
                                                    <div>
                                                        <div className={`text-[8px] font-black leading-none mb-1 opacity-50 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                                            {localTrimestre}º TRIMESTRE
                                                        </div>
                                                        <div className={`text-xs font-black transition-colors ${isSelected ? 'text-blue-900' : 'text-slate-400'}`}>
                                                            SEMANA {week.semana}
                                                        </div>
                                                        <div className="text-[10px] font-medium text-slate-400">
                                                            Hereda límites globales del trimestre
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-200 group-hover:border-slate-300'
                                                    }`}>
                                                    {isSelected && <span className="material-symbols-rounded text-white text-base">check</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="text-xs font-medium text-slate-400 italic">
                        Seleccionadas: <span className="font-black text-blue-600">{selectedWeeks.size} semanas</span>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="ghost" className="h-12 px-6 font-bold" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            className="h-12 px-8 bg-blue-600 rounded-2xl font-black shadow-lg shadow-blue-500/20"
                            onClick={handleSave}
                            disabled={isSaving || selectedWeeks.size === 0}
                        >
                            {isSaving ? (
                                <span className="material-symbols-rounded animate-spin">sync</span>
                            ) : (
                                'CONFIRMAR Y GUARDAR'
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


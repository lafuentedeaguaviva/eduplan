'use client';

import { useEffect, useState } from 'react';
import { AdminService } from '@/services/admin.service';
import { CatalogService } from '@/services/catalog.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlanificacionGeneral } from '@/types';

export default function AdminSchedulePage() {
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [gestion, setGestion] = useState(new Date().getFullYear());
    const [trimestre, setTrimestre] = useState(1);

    const loadSchedule = async () => {
        setLoading(true);
        const { data } = await AdminService.getGlobalSchedule(gestion, trimestre);
        setSchedule(data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadSchedule();
    }, [gestion, trimestre]);

    // Bulk generate state
    const [showGenerator, setShowGenerator] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [weeksPerMonth, setWeeksPerMonth] = useState<number[]>([4, 4, 4]);

    const calculateEndDateFromWeeks = (start: string, weeks: number[]) => {
        if (!start) return '';
        const totalWeeks = weeks.reduce((a, b) => a + b, 0);
        const date = new Date(start + 'T00:00:00');
        date.setDate(date.getDate() + (totalWeeks * 7) - 3); // Approx Friday of last week
        return date.toISOString().split('T')[0];
    };

    const calculateWeeksFromEndDate = (start: string, end: string) => {
        if (!start || !end) return;
        const d1 = new Date(start + 'T00:00:00');
        const d2 = new Date(end + 'T00:00:00');
        const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.max(1, Math.round(diffDays / 7));

        const base = Math.floor(totalWeeks / 3);
        const rem = totalWeeks % 3;
        const next = [base, base, base];
        if (rem >= 1) next[1] += 1;
        if (rem >= 2) next[0] += 1;
        setWeeksPerMonth(next);
    };

    // Removal of automatic date sync as per user request to keep dates fixed
    // while allowing manual week count adjustments for "non-teaching" weeks.

    const [previewWeeks, setPreviewWeeks] = useState<any[]>([]);

    const generatePreview = () => {
        if (!startDate || !endDate) return;
        const weeks = [];

        for (let m = 0; m < 3; m++) {
            const monthWeeks = weeksPerMonth[m] || 4;
            for (let w = 1; w <= monthWeeks; w++) {
                weeks.push({
                    gestion: gestion,
                    trimestre: trimestre,
                    mes: m + 1, // Relative month 1-3
                    semana: w,
                    fecha_inicio_trimestre: startDate,
                    fecha_fin_trimestre: endDate
                });
            }
        }
        setPreviewWeeks(weeks);
    };

    const handleBulkGenerate = async () => {
        if (previewWeeks.length === 0) return alert('Genera la vista previa primero');
        setLoading(true);
        const result = await AdminService.bulkGenerateGlobalSchedule({
            gestion,
            trimestre,
            weeks: previewWeeks
        });
        if (result.success) {
            setShowGenerator(false);
            setPreviewWeeks([]);
            loadSchedule();
        } else {
            alert('Error: ' + (typeof result.error === 'object' ? JSON.stringify(result.error) : result.error));
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta semana?')) return;
        const { error } = await AdminService.deleteGlobalWeek(id);
        if (!error) loadSchedule();
    };

    // Edit dates state
    const [showEditDates, setShowEditDates] = useState(false);
    const [editStartDate, setEditStartDate] = useState('');
    const [editEndDate, setEditEndDate] = useState('');

    const handleOpenEditDates = () => {
        if (schedule.length > 0) {
            setEditStartDate(schedule[0].fecha_inicio_trimestre || '');
            setEditEndDate(schedule[0].fecha_fin_trimestre || '');
        }
        setShowEditDates(true);
    };

    const handleSaveEditDates = async () => {
        if (!editStartDate || !editEndDate) return alert('Selecciona ambas fechas');
        setLoading(true);
        try {
            for (const week of schedule) {
                await AdminService.updateGlobalWeek(week.id, {
                    fecha_inicio_trimestre: editStartDate,
                    fecha_fin_trimestre: editEndDate
                });
            }
            setShowEditDates(false);
            loadSchedule();
        } catch (error) {
            alert('Error al actualizar fechas');
            setLoading(false);
        }
    };

    const handleAddWeekToMonth = async (mesStr: string, currentWeeks: any[]) => {
        const mes = Number(mesStr);
        const nextSemana = currentWeeks.length > 0 ? Math.max(...currentWeeks.map(w => w.semana)) + 1 : 1;
        const refWeek = currentWeeks.length > 0 ? currentWeeks[0] : schedule[0];
        
        const newWeek = {
            id: (gestion % 100 * 1000) + (trimestre * 100) + (mes * 10) + nextSemana,
            gestion,
            trimestre,
            mes,
            semana: nextSemana,
            fecha_inicio_trimestre: refWeek?.fecha_inicio_trimestre || '',
            fecha_fin_trimestre: refWeek?.fecha_fin_trimestre || ''
        };
        
        setLoading(true);
        const { error } = await AdminService.createGlobalWeek(newWeek);
        if (error) {
            alert('Error al crear semana');
            setLoading(false);
        } else {
            loadSchedule();
        }
    };

    // Edit single week state
    const [editSingleWeek, setEditSingleWeek] = useState<any>(null);
    const [singleWeekData, setSingleWeekData] = useState({
        fecha_inicio_mes: '',
        fecha_fin_mes: '',
        fecha_inicio_semana: '',
        fecha_fin_semana: ''
    });

    const handleOpenEditSingleWeek = (week: any) => {
        setEditSingleWeek(week);
        setSingleWeekData({
            fecha_inicio_mes: week.fecha_inicio_mes || '',
            fecha_fin_mes: week.fecha_fin_mes || '',
            fecha_inicio_semana: week.fecha_inicio_semana || '',
            fecha_fin_semana: week.fecha_fin_semana || ''
        });
    };

    const handleSaveSingleWeek = async () => {
        if (!editSingleWeek) return;

        // Validaciones de fechas
        const trimInicio = new Date(editSingleWeek.fecha_inicio_trimestre + 'T00:00:00');
        const trimFin = new Date(editSingleWeek.fecha_fin_trimestre + 'T00:00:00');

        let mesInicio = null;
        let mesFin = null;

        if (singleWeekData.fecha_inicio_mes) {
            mesInicio = new Date(singleWeekData.fecha_inicio_mes + 'T00:00:00');
            if (mesInicio < trimInicio || mesInicio > trimFin) {
                return alert('La fecha de inicio del mes debe estar dentro de las fechas del trimestre.');
            }
        }

        if (singleWeekData.fecha_fin_mes) {
            mesFin = new Date(singleWeekData.fecha_fin_mes + 'T00:00:00');
            if (mesFin < trimInicio || mesFin > trimFin) {
                return alert('La fecha de fin del mes debe estar dentro de las fechas del trimestre.');
            }
        }

        if (mesInicio && mesFin && mesInicio > mesFin) {
            return alert('La fecha de inicio del mes no puede ser posterior a la fecha de fin.');
        }

        // Definir los límites para la semana basados en si hay fechas de mes
        const limiteInicio = mesInicio || trimInicio;
        const limiteFin = mesFin || trimFin;

        if (singleWeekData.fecha_inicio_semana) {
            const semInicio = new Date(singleWeekData.fecha_inicio_semana + 'T00:00:00');
            if (semInicio < limiteInicio || semInicio > limiteFin) {
                return alert(`La fecha de inicio de la semana debe estar dentro de las fechas del ${mesInicio ? 'mes' : 'trimestre'}.`);
            }
        }

        if (singleWeekData.fecha_fin_semana) {
            const semFin = new Date(singleWeekData.fecha_fin_semana + 'T00:00:00');
            if (semFin < limiteInicio || semFin > limiteFin) {
                return alert(`La fecha de fin de la semana debe estar dentro de las fechas del ${mesFin ? 'mes' : 'trimestre'}.`);
            }
        }

        if (singleWeekData.fecha_inicio_semana && singleWeekData.fecha_fin_semana) {
            const semInicio = new Date(singleWeekData.fecha_inicio_semana + 'T00:00:00');
            const semFin = new Date(singleWeekData.fecha_fin_semana + 'T00:00:00');
            if (semInicio > semFin) {
                return alert('La fecha de inicio de la semana no puede ser posterior a la fecha de fin.');
            }
        }

        setLoading(true);
        
        // Ensure empty strings are sent as null to avoid PostgreSQL date syntax errors
        const payload = {
            fecha_inicio_mes: singleWeekData.fecha_inicio_mes || null,
            fecha_fin_mes: singleWeekData.fecha_fin_mes || null,
            fecha_inicio_semana: singleWeekData.fecha_inicio_semana || null,
            fecha_fin_semana: singleWeekData.fecha_fin_semana || null
        };

        const { error } = await AdminService.updateGlobalWeek(editSingleWeek.id, payload);
        if (!error) {
            setEditSingleWeek(null);
            loadSchedule();
        } else {
            alert('Error al actualizar la semana');
            setLoading(false);
        }
    };


    return (
        <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cronograma Global</h1>
                    <p className="text-slate-500 font-medium mt-1">Configura las fechas de referencia para todo el sistema</p>
                </div>

                <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gestión</label>
                        <Input
                            type="number"
                            value={gestion}
                            onChange={(e) => setGestion(Number(e.target.value))}
                            className="w-24 h-10 font-bold"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trimestre</label>
                        <select
                            value={trimestre}
                            onChange={(e) => setTrimestre(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none"
                        >
                            <option value={1}>1º Trimestre</option>
                            <option value={2}>2º Trimestre</option>
                            <option value={3}>3º Trimestre</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Actions & Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-600">calendar_month</span>
                        Semanas Definidas ({schedule.length})
                    </h2>
                    <div className="flex gap-3">
                        {schedule.length > 0 && (
                            <Button
                                onClick={handleOpenEditDates}
                                variant="outline"
                                className="border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl h-11 px-6 font-bold"
                            >
                                <span className="material-symbols-rounded mr-2">edit_calendar</span>
                                MODIFICAR FECHAS
                            </Button>
                        )}
                        <Button
                            onClick={() => setShowGenerator(true)}
                            className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-11 px-6 font-black shadow-lg shadow-blue-500/20"
                        >
                            <span className="material-symbols-rounded mr-2">auto_fix_high</span>
                            GENERADOR AUTOMÁTICO
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <span className="material-symbols-rounded animate-spin text-4xl text-blue-600">sync</span>
                    </div>
                ) : schedule.length > 0 ? (
                    <div className="space-y-12">
                        {Object.entries(
                            schedule.reduce((acc, week) => {
                                if (!acc[week.mes]) acc[week.mes] = [];
                                acc[week.mes].push(week);
                                return acc;
                            }, {} as Record<number, PlanificacionGeneral[]>)
                        ).map(([mes, weeks]) => (
                            <div key={mes} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                                            MES {mes}
                                        </h3>
                                        <div className="h-px flex-1 bg-slate-100 mr-4"></div>
                                    </div>
                                    <button 
                                        onClick={() => handleAddWeekToMonth(mes, weeks as any[])}
                                        className="text-xs font-black text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors bg-white border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl shadow-sm"
                                    >
                                        <span className="material-symbols-rounded text-sm">add</span>
                                        AÑADIR SEMANA
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {(weeks as PlanificacionGeneral[]).map(week => (
                                        <div key={week.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => handleOpenEditSingleWeek(week)}
                                                    className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                                                    title="Editar fechas detalladas"
                                                >
                                                    <span className="material-symbols-rounded text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(week.id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Eliminar semana"
                                                >
                                                    <span className="material-symbols-rounded text-lg">delete</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex flex-col items-center justify-center shrink-0">
                                                    <span className="text-[10px] font-black text-blue-400 leading-none">SEMANA</span>
                                                    <span className="text-xl font-black text-blue-600 leading-none">{week.semana}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">
                                                        TRIMESTRE {week.trimestre}
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-700 truncate">
                                                        Estructura Global
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-4 border-t border-slate-50 text-[11px] font-medium text-slate-500">
                                                <div className="flex items-center justify-between">
                                                    <span>Inicio:</span>
                                                    <span className="text-slate-900 font-bold">
                                                        {week.fecha_inicio_trimestre?.split('-').reverse().join('/') || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Fin:</span>
                                                    <span className="text-slate-900 font-bold">
                                                        {week.fecha_fin_trimestre?.split('-').reverse().join('/') || 'N/A'}
                                                    </span>
                                                </div>
                                                
                                                {/* Optional Month/Week Dates */}
                                                {(week.fecha_inicio_mes || week.fecha_inicio_semana) && (
                                                    <div className="pt-2 mt-2 border-t border-dashed border-slate-100 space-y-1">
                                                        {(week.fecha_inicio_mes || week.fecha_fin_mes) && (
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <span className="text-slate-400">Mes:</span>
                                                                <span className="text-slate-600 font-semibold">
                                                                    {week.fecha_inicio_mes?.split('-').reverse().slice(0,2).join('/') || '?'} al {week.fecha_fin_mes?.split('-').reverse().slice(0,2).join('/') || '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {(week.fecha_inicio_semana || week.fecha_fin_semana) && (
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <span className="text-slate-400">Semana:</span>
                                                                <span className="text-slate-600 font-semibold">
                                                                    {week.fecha_inicio_semana?.split('-').reverse().slice(0,2).join('/') || '?'} al {week.fecha_fin_semana?.split('-').reverse().slice(0,2).join('/') || '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <span className="material-symbols-rounded text-4xl text-slate-300 mb-4">event_busy</span>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No hay semanas para este criterio</h3>
                        <p className="text-slate-400 text-sm max-w-[280px] mx-auto font-medium mb-6">
                            Utiliza el generador automático para poblar las fechas rápidamente.
                        </p>
                    </div>
                )}
            </div>

            {/* Bulk Generator Modal */}
            {showGenerator && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowGenerator(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Generador Automático</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Inicio (Lunes)</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="font-bold h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Fin (Viernes)</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="font-bold h-12"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semanas por Mes (Trimestre)</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {weeksPerMonth.map((w, i) => (
                                        <div key={i} className="space-y-1">
                                            <span className="text-[9px] font-bold text-slate-300">MES {i + 1}</span>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={10}
                                                value={w}
                                                onChange={(e) => {
                                                    const next = [...weeksPerMonth];
                                                    next[i] = Number(e.target.value);
                                                    setWeeksPerMonth(next);
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 h-10 text-center font-bold"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <Button variant="ghost" className="flex-1 h-12 font-bold" onClick={() => setShowGenerator(false)}>
                                    CANCELAR
                                </Button>
                                <Button
                                    className="flex-1 h-12 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-2xl font-black"
                                    onClick={generatePreview}
                                >
                                    VISTA PREVIA
                                </Button>
                            </div>

                            {previewWeeks.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-slate-100 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ajustar Semanas Individuales</h3>
                                    {previewWeeks.map((pw, idx) => (
                                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between gap-4">
                                            <div className="shrink-0 flex flex-col items-center justify-center w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100">
                                                <span className="text-[8px] font-black text-slate-400 leading-none">MES</span>
                                                <span className="text-sm font-black text-slate-600 leading-none">{pw.mes}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-xs font-black text-slate-800 uppercase">Trimestre {pw.trimestre} - Semana {pw.semana}</div>
                                                <div className="text-[9px] font-medium text-slate-400">Rango Global: {pw.fecha_inicio_trimestre?.split('-').reverse().join('/') || '...'} al {pw.fecha_fin_trimestre?.split('-').reverse().join('/') || '...'}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        className="w-full h-12 bg-blue-600 rounded-2xl font-black shadow-xl shadow-blue-500/20 sticky bottom-0"
                                        onClick={handleBulkGenerate}
                                        disabled={loading}
                                    >
                                        {loading ? 'GUARDANDO...' : 'CONFIRMAR Y GUARDAR TODO'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Dates Modal */}
            {showEditDates && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditDates(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Modificar Fechas del Trimestre</h2>
                        <p className="text-sm text-slate-500 mb-6 font-medium">Esto actualizará las fechas de inicio y fin para todas las semanas de este trimestre.</p>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nueva Fecha de Inicio</label>
                                    <Input
                                        type="date"
                                        value={editStartDate}
                                        onChange={(e) => setEditStartDate(e.target.value)}
                                        className="font-bold h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nueva Fecha de Fin</label>
                                    <Input
                                        type="date"
                                        value={editEndDate}
                                        onChange={(e) => setEditEndDate(e.target.value)}
                                        className="font-bold h-12"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <Button variant="ghost" className="flex-1 h-12 font-bold" onClick={() => setShowEditDates(false)}>
                                    CANCELAR
                                </Button>
                                <Button
                                    className="flex-1 h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black shadow-lg shadow-blue-500/20"
                                    onClick={handleSaveEditDates}
                                    disabled={loading}
                                >
                                    {loading ? 'GUARDANDO...' : 'GUARDAR FECHAS'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Single Week Modal */}
            {editSingleWeek && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditSingleWeek(null)}></div>
                    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Detalles de la Semana {editSingleWeek.semana}</h2>
                        <p className="text-sm text-slate-500 mb-6 font-medium">Define fechas opcionales específicas para este mes y semana (Mes {editSingleWeek.mes}).</p>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Fechas del Mes</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio Mes</label>
                                        <Input
                                            type="date"
                                            value={singleWeekData.fecha_inicio_mes}
                                            onChange={(e) => setSingleWeekData({ ...singleWeekData, fecha_inicio_mes: e.target.value })}
                                            className="font-bold h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fin Mes</label>
                                        <Input
                                            type="date"
                                            value={singleWeekData.fecha_fin_mes}
                                            onChange={(e) => setSingleWeekData({ ...singleWeekData, fecha_fin_mes: e.target.value })}
                                            className="font-bold h-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Fechas de la Semana</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inicio Semana</label>
                                        <Input
                                            type="date"
                                            value={singleWeekData.fecha_inicio_semana}
                                            onChange={(e) => setSingleWeekData({ ...singleWeekData, fecha_inicio_semana: e.target.value })}
                                            className="font-bold h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fin Semana</label>
                                        <Input
                                            type="date"
                                            value={singleWeekData.fecha_fin_semana}
                                            onChange={(e) => setSingleWeekData({ ...singleWeekData, fecha_fin_semana: e.target.value })}
                                            className="font-bold h-12"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <Button variant="ghost" className="flex-1 h-12 font-bold" onClick={() => setEditSingleWeek(null)}>
                                    CANCELAR
                                </Button>
                                <Button
                                    className="flex-1 h-12 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black shadow-lg shadow-blue-500/20"
                                    onClick={handleSaveSingleWeek}
                                    disabled={loading}
                                >
                                    {loading ? 'GUARDANDO...' : 'GUARDAR FECHAS'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


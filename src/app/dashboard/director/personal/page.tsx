'use client';

import React, { useState, useEffect } from 'react';
import { InstitucionalService } from '@/services/institucional.service';
import { CVService, CVData } from '@/services/cv.service';
import { PdcRevisionesService, PdcRevision } from '@/services/pdc-revisiones.service';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Users, Clock, FileText, ChevronRight, X, GraduationCap, Briefcase, Award, FileStack, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function DirectorDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [unidadEducativaId, setUnidadEducativaId] = useState<number | null>(null);
    const [personal, setPersonal] = useState<any[]>([]);
    const [horarios, setHorarios] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [teacherCv, setTeacherCv] = useState<CVData | null>(null);
    const [cvLoading, setCvLoading] = useState(false);
    
    // UI State
    const [activeTab, setActiveTab] = useState<'personal' | 'horarios'>('personal');
    const [drawerTab, setDrawerTab] = useState<'cv' | 'horarios' | 'pdcs'>('cv');
    const [teacherPdcs, setTeacherPdcs] = useState<PdcRevision[]>([]);
    const [pdcsLoading, setPdcsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                loadData();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: ueId, success: ueSuccess } = await InstitucionalService.getMiUnidadEducativa(user!.id);
            if (!ueSuccess || !ueId) {
                toast.error("No se encontró su unidad educativa");
                setLoading(false);
                return;
            }
            setUnidadEducativaId(ueId);

            const [persData, horData] = await Promise.all([
                InstitucionalService.getPersonalEscuela(ueId),
                InstitucionalService.getHorariosGenerales(ueId)
            ]);

            if (persData.success) {
                const docentes = persData.data
                    .filter((p: any) => p.rol_institucional === 'Docente')
                    .sort((a: any, b: any) => {
                        const nameA = `${a.perfiles?.apellidos || ''} ${a.perfiles?.nombres || ''}`.trim();
                        const nameB = `${b.perfiles?.apellidos || ''} ${b.perfiles?.nombres || ''}`.trim();
                        return nameA.localeCompare(nameB);
                    });
                setPersonal(docentes);
            }
            if (horData.success) setHorarios(horData.data);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTeacher = async (perfilId: string) => {
        setSelectedTeacherId(perfilId);
        setDrawerTab('cv'); // Default tab
        setCvLoading(true);
        setPdcsLoading(true);
        
        try {
            const [cvRes, pdcsRes] = await Promise.all([
                CVService.getProfesorCV(perfilId),
                PdcRevisionesService.getTeacherSubmissions(perfilId).catch(() => [])
            ]);

            if (cvRes.success && cvRes.data) {
                setTeacherCv(cvRes.data);
            } else {
                setTeacherCv(null);
            }
            setTeacherPdcs(Array.isArray(pdcsRes) ? pdcsRes : []);
        } catch (error) {
            console.error("Error fetching teacher details:", error);
            toast.error("Error al cargar los detalles del docente");
        } finally {
            setCvLoading(false);
            setPdcsLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-medium">Cargando panel de dirección...</div>;

    // Procesar horarios unificados
    const todosLosHorarios = horarios.map(h => ({
        profesor: `${h.perfiles?.nombres} ${h.perfiles?.apellidos}`,
        profesor_id: h.profesor_id,
        materia: h.nombre,
        bloques: h.area_trabajo_paralelo?.flatMap((atp: any) => {
            const hor = atp.horario || {};
            return Object.entries(hor).flatMap(([dia, periodos]: [string, any]) => 
                periodos.map((p: any) => ({ dia, inicio: p.inicio, fin: p.fin }))
            );
        }) || []
    }));

    return (
        <div className="max-w-6xl mx-auto p-6 animate-in fade-in zoom-in-95 duration-500 pb-24 flex gap-6 relative">
            
            <div className="flex-1 transition-all duration-300">
                <div className="mb-8">
                    <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold mb-6 text-sm bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl shadow-sm w-fit">
                        <ArrowLeft className="size-4" /> Volver al Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dirección General</h1>
                    <p className="text-slate-500 mt-2 font-medium">Supervisa el personal, currículums y horarios de tu institución.</p>
                </div>

                <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Users className="size-5 text-indigo-500"/> Personal Registrado</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {personal.map(p => (
                            <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-indigo-300 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">
                                        {p.perfiles?.nombres?.charAt(0) || 'D'}{p.perfiles?.apellidos?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{p.perfiles?.nombres} {p.perfiles?.apellidos}</h3>
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{p.rol_institucional}</p>
                                    </div>
                                </div>
                                {p.rol_institucional === 'Docente' && (
                                    <Button 
                                        variant="ghost" 
                                        onClick={() => handleSelectTeacher(p.perfiles.id)}
                                        className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                                    >
                                        Ver Detalles <ChevronRight className="size-4 ml-1" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {personal.length === 0 && <p className="text-slate-400 font-medium col-span-2">No hay personal registrado.</p>}
                    </div>
                </div>
            </div>

            {/* Panel lateral (Drawer) de Detalles */}
            {selectedTeacherId && (() => {
                const selectedTeacher = personal.find(p => p.perfiles?.id === selectedTeacherId);
                const teacherName = selectedTeacher ? `${selectedTeacher.perfiles?.nombres || ''} ${selectedTeacher.perfiles?.apellidos || ''}`.trim() : 'Docente';
                
                // Extraer horarios específicos
                const horariosDelDocente = todosLosHorarios.filter(h => h.profesor_id === selectedTeacherId);
                
                return (
                <div className="w-[500px] shrink-0 bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden sticky top-6 h-[calc(100vh-3rem)] animate-in slide-in-from-right-8 duration-500 flex flex-col">
                    <div className="p-5 border-b-2 border-slate-100 bg-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-black text-slate-800 text-lg line-clamp-1">{teacherName}</h2>
                            <Button variant="ghost" onClick={() => setSelectedTeacherId(null)} className="size-8 p-0 rounded-full hover:bg-slate-200 text-slate-500 shrink-0">
                                <X className="size-4" />
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setDrawerTab('cv')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5 ${drawerTab === 'cv' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                            >
                                <FileText className="size-3.5" /> CV
                            </button>
                            <button 
                                onClick={() => setDrawerTab('horarios')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5 ${drawerTab === 'horarios' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                            >
                                <Clock className="size-3.5" /> Horarios
                            </button>
                            <button 
                                onClick={() => setDrawerTab('pdcs')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex justify-center items-center gap-1.5 ${drawerTab === 'pdcs' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                            >
                                <FileStack className="size-3.5" /> PDCs
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-white relative">
                        {drawerTab === 'cv' && (
                            <div className="animate-in fade-in duration-300 space-y-8">
                                {cvLoading ? (
                                    <div className="text-center py-10 text-slate-400 font-medium animate-pulse">Obteniendo currículum...</div>
                                ) : teacherCv ? (
                                    <>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Sobre el Docente</h3>
                                            <p className="text-slate-700 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">{teacherCv.sobre_mi || 'No se añadió información.'}</p>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><GraduationCap className="size-4 text-emerald-500"/> Formación Académica</h3>
                                            <div className="space-y-3">
                                                {teacherCv.formacion_academica?.map((f, i) => (
                                                    <div key={i} className="border-l-2 border-emerald-200 pl-4 py-1">
                                                        <h4 className="font-bold text-slate-800 text-sm">{f.titulo}</h4>
                                                        <p className="text-slate-500 text-xs font-medium">{f.institucion} • {f.anio}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Briefcase className="size-4 text-blue-500"/> Experiencia Laboral</h3>
                                            <div className="space-y-4">
                                                {teacherCv.experiencia_laboral?.map((e, i) => (
                                                    <div key={i} className="border-l-2 border-blue-200 pl-4 py-1">
                                                        <h4 className="font-bold text-slate-800 text-sm">{e.cargo}</h4>
                                                        <p className="text-slate-500 text-xs font-medium mb-1">{e.institucion} • {e.periodo}</p>
                                                        <p className="text-slate-600 text-xs leading-relaxed">{e.descripcion}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Award className="size-4 text-amber-500"/> Habilidades</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {teacherCv.habilidades?.map((h, i) => (
                                                    <div key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-2">
                                                        {h.nombre} <span className="opacity-40">|</span> <span>{h.nivel}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="inline-flex size-16 bg-slate-100 text-slate-400 rounded-full items-center justify-center mb-4">
                                            <FileText className="size-8" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-700">Sin Curriculum</h3>
                                        <p className="text-slate-500 text-sm font-medium mt-2">El docente no ha rellenado los datos de su CV en la plataforma.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {drawerTab === 'horarios' && (
                            <div className="animate-in fade-in duration-300 space-y-6">
                                {horariosDelDocente.map((h, i) => (
                                    <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                        <h3 className="font-bold text-slate-800 text-base mb-3">{h.materia}</h3>
                                        <div className="flex flex-col gap-2">
                                            {h.bloques.length > 0 ? (
                                                h.bloques.map((b: any, bi: number) => (
                                                    <div key={bi} className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-bold flex items-center justify-between shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs">P. {b.paralelo}</span>
                                                            <span className="capitalize text-indigo-600">{b.dia}</span>
                                                        </div>
                                                        <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-xs">{b.inicio} - {b.fin}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm font-medium text-slate-400 italic">No se han configurado horas para esta materia.</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {horariosDelDocente.length === 0 && (
                                    <div className="text-center py-10">
                                        <div className="inline-flex size-16 bg-slate-100 text-slate-400 rounded-full items-center justify-center mb-4">
                                            <Clock className="size-8" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-700">Sin Horarios</h3>
                                        <p className="text-slate-500 text-sm font-medium mt-2">El docente no tiene materias con horarios asignados.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {drawerTab === 'pdcs' && (
                            <div className="animate-in fade-in duration-300 space-y-4">
                                {pdcsLoading ? (
                                    <div className="text-center py-10 text-slate-400 font-medium animate-pulse">Obteniendo PDCs...</div>
                                ) : teacherPdcs.length > 0 ? (
                                    teacherPdcs.map(pdc => {
                                        const statusColor = 
                                            pdc.pdc_estado === 'Finalizado' || pdc.pdc_estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            pdc.pdc_estado === 'Enviado' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            pdc.pdc_estado === 'Observado' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-slate-100 text-slate-700 border-slate-200';
                                            
                                        return (
                                            <div key={pdc.id} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 transition-colors shadow-sm cursor-pointer" onClick={() => router.push(`/dashboard/reporting/viewer/${pdc.id}`)}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-800 text-sm">{pdc.materia}</h4>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border ${statusColor}`}>
                                                        {pdc.pdc_estado}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 mb-2">
                                                    {pdc.grado} - {pdc.nivel}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Actualizado: {new Date(pdc.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="inline-flex size-16 bg-slate-100 text-slate-400 rounded-full items-center justify-center mb-4">
                                            <FileStack className="size-8" />
                                        </div>
                                        <h3 className="text-lg font-black text-slate-700">Sin PDCs</h3>
                                        <p className="text-slate-500 text-sm font-medium mt-2">El docente no ha enviado PDCs para revisión.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                );
            })()}
        </div>
    );
}

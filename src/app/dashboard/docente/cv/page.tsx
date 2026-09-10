'use client';

import React, { useState, useEffect } from 'react';
import { CVService, CVData } from '@/services/cv.service';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { FileText, Plus, Trash, Save, Briefcase, GraduationCap, Award } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfesorCVPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [cvData, setCvData] = useState<CVData>({
        formacion_academica: [],
        experiencia_laboral: [],
        habilidades: [],
        sobre_mi: ''
    });

    useEffect(() => {
        if (user) {
            loadCV();
        }
    }, [user]);

    const loadCV = async () => {
        setLoading(true);
        const { data, success } = await CVService.getProfesorCV(user!.id);
        if (success && data) {
            setCvData({
                formacion_academica: data.formacion_academica || [],
                experiencia_laboral: data.experiencia_laboral || [],
                habilidades: data.habilidades || [],
                sobre_mi: data.sobre_mi || ''
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const { success } = await CVService.upsertProfesorCV(user!.id, cvData);
        if (success) {
            toast.success("Curriculum actualizado correctamente.");
        } else {
            toast.error("Error al guardar el Curriculum.");
        }
        setSaving(false);
    };

    const addFormacion = () => {
        setCvData({
            ...cvData,
            formacion_academica: [...cvData.formacion_academica, { titulo: '', institucion: '', anio: '', url_documento: '' }]
        });
    };

    const updateFormacion = (index: number, field: string, value: string) => {
        const newData = [...cvData.formacion_academica];
        newData[index][field] = value;
        setCvData({ ...cvData, formacion_academica: newData });
    };

    const removeFormacion = (index: number) => {
        const newData = cvData.formacion_academica.filter((_, i) => i !== index);
        setCvData({ ...cvData, formacion_academica: newData });
    };

    const addExperiencia = () => {
        setCvData({
            ...cvData,
            experiencia_laboral: [...cvData.experiencia_laboral, { cargo: '', institucion: '', periodo: '', descripcion: '', url_documento: '' }]
        });
    };

    const updateExperiencia = (index: number, field: string, value: string) => {
        const newData = [...cvData.experiencia_laboral];
        newData[index][field] = value;
        setCvData({ ...cvData, experiencia_laboral: newData });
    };

    const removeExperiencia = (index: number) => {
        const newData = cvData.experiencia_laboral.filter((_, i) => i !== index);
        setCvData({ ...cvData, experiencia_laboral: newData });
    };

    const addHabilidad = () => {
        setCvData({
            ...cvData,
            habilidades: [...cvData.habilidades, { nombre: '', nivel: 'Intermedio', url_documento: '' }]
        });
    };

    const updateHabilidad = (index: number, field: string, value: string) => {
        const newData = [...cvData.habilidades];
        newData[index][field] = value;
        setCvData({ ...cvData, habilidades: newData });
    };

    const removeHabilidad = (index: number) => {
        const newData = cvData.habilidades.filter((_, i) => i !== index);
        setCvData({ ...cvData, habilidades: newData });
    };

    if (loading) {
        return <div className="p-8 text-slate-500 animate-pulse font-medium">Cargando perfil...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in-95 duration-500 pb-24">
            <div className="mb-6">
                <Link href="/dashboard/resources" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm">
                    <span className="material-symbols-rounded text-lg">arrow_back</span>
                    Volver a Recursos Docentes
                </Link>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <FileText className="size-5" />
                        </div>
                        Mi Currículum Vitae
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Completa tu perfil profesional para que el Director pueda visualizarlo.</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-12 px-6 mt-4 md:mt-0 shadow-lg shadow-indigo-200"
                >
                    {saving ? 'Guardando...' : <><Save className="mr-2 size-4" /> Guardar CV</>}
                </Button>
            </div>

            <div className="space-y-8">
                {/* Sobre Mí */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm">
                    <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <FileText className="size-5 text-indigo-500" /> Sobre Mí (Perfil Profesional)
                    </h2>
                    <textarea 
                        value={cvData.sobre_mi}
                        onChange={(e) => setCvData({ ...cvData, sobre_mi: e.target.value })}
                        placeholder="Soy un docente apasionado por..."
                        className="w-full min-h-[120px] bg-slate-50 border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-indigo-500 text-slate-700 font-medium"
                    />
                </div>

                {/* Formación Académica */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <GraduationCap className="size-5 text-emerald-500" /> Formación Académica
                        </h2>
                        <Button onClick={addFormacion} variant="outline" size="sm" className="rounded-lg text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                            <Plus className="size-4 mr-1" /> Añadir
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        {cvData.formacion_academica.map((item, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex-1 space-y-3 w-full">
                                    <input 
                                        type="text" placeholder="Título Obtenido (ej. Lic. Matemáticas)" 
                                        value={item.titulo} onChange={(e) => updateFormacion(idx, 'titulo', e.target.value)}
                                        className="w-full bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-emerald-500 text-sm font-medium"
                                    />
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" placeholder="Institución" 
                                            value={item.institucion} onChange={(e) => updateFormacion(idx, 'institucion', e.target.value)}
                                            className="w-full bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-emerald-500 text-sm font-medium"
                                        />
                                        <input 
                                            type="text" placeholder="Año" 
                                            value={item.anio} onChange={(e) => updateFormacion(idx, 'anio', e.target.value)}
                                            className="w-28 bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-emerald-500 text-sm font-medium"
                                        />
                                    </div>
                                    <input 
                                        type="url" placeholder="URL de respaldo (Drive, Certificado...)" 
                                        value={item.url_documento || ''} onChange={(e) => updateFormacion(idx, 'url_documento', e.target.value)}
                                        className="w-full bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-emerald-500 text-sm font-medium"
                                    />
                                </div>
                                <Button onClick={() => removeFormacion(idx)} variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 mt-1 md:mt-0">
                                    <Trash className="size-4" />
                                </Button>
                            </div>
                        ))}
                        {cvData.formacion_academica.length === 0 && (
                            <p className="text-slate-400 text-sm italic">No hay formación añadida.</p>
                        )}
                    </div>
                </div>

                {/* Experiencia Laboral */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Briefcase className="size-5 text-blue-500" /> Experiencia Laboral
                        </h2>
                        <Button onClick={addExperiencia} variant="outline" size="sm" className="rounded-lg text-blue-700 border-blue-200 hover:bg-blue-50">
                            <Plus className="size-4 mr-1" /> Añadir
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        {cvData.experiencia_laboral.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" placeholder="Cargo (ej. Profesor de Secundaria)" 
                                            value={item.cargo} onChange={(e) => updateExperiencia(idx, 'cargo', e.target.value)}
                                            className="w-full bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-blue-500 text-sm font-medium"
                                        />
                                        <input 
                                            type="text" placeholder="Periodo (ej. 2020-2023)" 
                                            value={item.periodo} onChange={(e) => updateExperiencia(idx, 'periodo', e.target.value)}
                                            className="w-32 bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-blue-500 text-sm font-medium"
                                        />
                                    </div>
                                    <input 
                                        type="text" placeholder="Institución Educativa" 
                                        value={item.institucion} onChange={(e) => updateExperiencia(idx, 'institucion', e.target.value)}
                                        className="w-full bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-blue-500 text-sm font-medium"
                                    />
                                    <textarea 
                                        placeholder="Descripción de funciones principales" 
                                        value={item.descripcion} onChange={(e) => updateExperiencia(idx, 'descripcion', e.target.value)}
                                        className="w-full min-h-[60px] bg-white border-2 border-slate-200 rounded-lg p-3 outline-none focus:border-blue-500 text-sm font-medium"
                                    />
                                    <input 
                                        type="url" placeholder="URL de respaldo (Contrato, Carta...)" 
                                        value={item.url_documento || ''} onChange={(e) => updateExperiencia(idx, 'url_documento', e.target.value)}
                                        className="w-full bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-blue-500 text-sm font-medium"
                                    />
                                </div>
                                <Button onClick={() => removeExperiencia(idx)} variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 mt-1">
                                    <Trash className="size-4" />
                                </Button>
                            </div>
                        ))}
                        {cvData.experiencia_laboral.length === 0 && (
                            <p className="text-slate-400 text-sm italic">No hay experiencia añadida.</p>
                        )}
                    </div>
                </div>

                {/* Habilidades */}
                <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Award className="size-5 text-amber-500" /> Habilidades Destacadas
                        </h2>
                        <Button onClick={addHabilidad} variant="outline" size="sm" className="rounded-lg text-amber-700 border-amber-200 hover:bg-amber-50">
                            <Plus className="size-4 mr-1" /> Añadir
                        </Button>
                    </div>
                    
                    <div className="space-y-3">
                        {cvData.habilidades.map((item, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex-1 space-y-3 w-full">
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" placeholder="Habilidad (ej. Herramientas Digitales)" 
                                            value={item.nombre} onChange={(e) => updateHabilidad(idx, 'nombre', e.target.value)}
                                            className="flex-1 bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-amber-500 text-sm font-medium"
                                        />
                                        <select 
                                            value={item.nivel} onChange={(e) => updateHabilidad(idx, 'nivel', e.target.value)}
                                            className="w-40 bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-amber-500 text-sm font-medium"
                                        >
                                            <option value="Básico">Básico</option>
                                            <option value="Intermedio">Intermedio</option>
                                            <option value="Avanzado">Avanzado</option>
                                            <option value="Experto">Experto</option>
                                        </select>
                                    </div>
                                    <input 
                                        type="url" placeholder="URL de respaldo (Certificado, Proyecto...)" 
                                        value={item.url_documento || ''} onChange={(e) => updateHabilidad(idx, 'url_documento', e.target.value)}
                                        className="w-full bg-white border-2 border-slate-200 rounded-lg h-10 px-3 outline-none focus:border-amber-500 text-sm font-medium"
                                    />
                                </div>
                                <Button onClick={() => removeHabilidad(idx)} variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50 mt-1 md:mt-0">
                                    <Trash className="size-4" />
                                </Button>
                            </div>
                        ))}
                        {cvData.habilidades.length === 0 && (
                            <p className="text-slate-400 text-sm italic">No hay habilidades añadidas.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

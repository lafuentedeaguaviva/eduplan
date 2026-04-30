'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';

export default function AdminCurriculumPage() {
    const router = useRouter();
    const {
        levels,
        grades,
        areas,
        baseContents,
        loading,
        saving,
        error: controllerError,
        checkAccess,
        loadCurriculumData,
        loadContentsBase,
        saveBaseContent
    } = useAdminController();

    const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
    const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
    const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
    const [showContentModal, setShowContentModal] = useState(false);
    const [editingContent, setEditingContent] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                loadCurriculumData();
            }
        };
        init();
    }, []);

    // Load grades when level changes
    useEffect(() => {
        if (selectedLevelId) {
            loadCurriculumData(selectedLevelId);
            setSelectedGradeId(null);
            setSelectedAreaId(null);
        }
    }, [selectedLevelId]);

    // Load contents when grade or area changes
    useEffect(() => {
        if (selectedGradeId || selectedAreaId) {
            loadContentsBase(selectedGradeId || undefined, selectedAreaId || undefined);
        }
    }, [selectedGradeId, selectedAreaId]);

    const handleLevelSelect = (id: number) => {
        setSelectedLevelId(id === selectedLevelId ? null : id);
    };

    const openCreateContent = () => {
        setEditingContent({
            titulo: '',
            orden: 1,
            trimestre: 1,
            grado_id: selectedGradeId,
            area_id: selectedAreaId
        });
        setShowContentModal(true);
    };

    const handleSaveContent = async () => {
        const success = await saveBaseContent(editingContent);
        if (success) {
            setShowContentModal(false);
            loadContentsBase(selectedGradeId || undefined, selectedAreaId || undefined);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/admin')} className="size-10 rounded-full bg-white shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group">
                        <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Gestión Curricular</h1>
                        <p className="text-slate-500 font-medium mt-1">Configura niveles, grados y contenidos base del sistema.</p>
                    </div>
                </div>
            </header>

            {/* Level Selector */}
            <div className="flex flex-wrap gap-4">
                {levels.map((level) => (
                    <button
                        key={level.id}
                        onClick={() => handleLevelSelect(level.id)}
                        className={`px-8 py-4 rounded-3xl font-black transition-all duration-300 border-2 ${
                            selectedLevelId === level.id
                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200 scale-105'
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {level.nombre}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Grades & Areas Navigation */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 border-none shadow-premium bg-slate-900/5 backdrop-blur-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                           <span className="material-symbols-rounded text-lg">school</span>
                           Estructura del Nivel
                        </h2>

                        {!selectedLevelId ? (
                            <div className="py-20 text-center space-y-4">
                                <span className="material-symbols-rounded text-4xl text-slate-200">touch_app</span>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selecciona un nivel para comenzar</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {grades.map((grade) => (
                                    <div key={grade.id} className="space-y-1">
                                        <button 
                                            onClick={() => setSelectedGradeId(grade.id === selectedGradeId ? null : grade.id)}
                                            className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all font-black text-sm ${
                                                selectedGradeId === grade.id 
                                                ? 'bg-white text-slate-900 shadow-soft border-2 border-slate-900/10' 
                                                : 'text-slate-500 hover:bg-white/50'
                                            }`}
                                        >
                                            {grade.nombre}
                                            <span className={`material-symbols-rounded transition-transform ${selectedGradeId === grade.id ? 'rotate-90' : ''}`}>chevron_right</span>
                                        </button>
                                        
                                        {selectedGradeId === grade.id && (
                                            <div className="pl-4 py-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
                                                {areas.map((area) => (
                                                    <button 
                                                        key={area.id}
                                                        onClick={() => setSelectedAreaId(area.id)}
                                                        className={`w-full text-left p-3 rounded-xl text-xs font-black transition-all ${
                                                            selectedAreaId === area.id 
                                                            ? 'text-slate-900 bg-white/80 shadow-sm border border-slate-100' 
                                                            : 'text-slate-400 hover:text-slate-600 hover:bg-white/30'
                                                        }`}
                                                    >
                                                        {area.nombre}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Content Manager */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="p-0 border-none shadow-premium min-h-[600px] flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Contenidos Base</h3>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-black text-[10px] uppercase">
                                        {selectedLevelId ? levels.find(l => l.id === selectedLevelId)?.nombre : 'Nivel'}
                                    </Badge>
                                    <span className="material-symbols-rounded text-slate-300">chevron_right</span>
                                    <Badge variant="outline" className="font-black text-[10px] uppercase">
                                        {selectedGradeId ? grades.find(g => g.id === selectedGradeId)?.nombre : 'Grado'}
                                    </Badge>
                                    <span className="material-symbols-rounded text-slate-300">chevron_right</span>
                                    <Badge variant="accent" className="font-black text-[10px] uppercase">
                                        {selectedAreaId ? areas.find(a => a.id === selectedAreaId)?.nombre : 'Área'}
                                    </Badge>
                                </div>
                            </div>
                            
                            <Button 
                                disabled={!selectedGradeId || !selectedAreaId}
                                onClick={openCreateContent}
                                className="rounded-2xl h-14 px-8 font-black bg-slate-900 hover:bg-black text-white gap-2 shadow-xl shadow-slate-200 disabled:opacity-30 disabled:shadow-none"
                            >
                                <span className="material-symbols-rounded">add</span>
                                Nuevo Contenido
                            </Button>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Cargando contenidos...</p>
                            </div>
                        ) : baseContents.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                    <span className="material-symbols-rounded text-5xl">inventory_2</span>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-black text-slate-900 text-lg">No hay contenidos registrados</p>
                                    <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">Selecciona un grado y área para ver los contenidos base o crea uno nuevo para este nivel.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {baseContents.map((content) => (
                                    <div key={content.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs">
                                                {content.orden || '—'}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{content.titulo}</h4>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                    {content.trimestre}º Trimestre 
                                                    {content.padre_id && <span className="ml-2 border-l border-slate-200 pl-2">Vínculo: Subcontenido</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingContent(content); setShowContentModal(true); }}
                                                className="p-3 rounded-xl hover:bg-white hover:shadow-soft text-slate-400 hover:text-blue-600 transition-all"
                                            >
                                                <span className="material-symbols-rounded text-xl">edit_note</span>
                                            </button>
                                            <button className="p-3 rounded-xl hover:bg-white hover:shadow-soft text-slate-400 hover:text-rose-600 transition-all">
                                                <span className="material-symbols-rounded text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Content Edit Modal */}
            {showContentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <Card className="w-full max-w-lg p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Configurar Contenido</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Editor Curricular</p>
                            </div>
                            <button onClick={() => setShowContentModal(false)} className="size-10 rounded-full hover:bg-slate-200 text-slate-400 transition-all flex items-center justify-center">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Título del Contenido</label>
                                <textarea 
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-slate-900 transition-all resize-none h-24"
                                    placeholder="Escribe el nombre del contenido curriculuar..."
                                    value={editingContent.titulo}
                                    onChange={(e) => setEditingContent({...editingContent, titulo: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Trimestre</label>
                                    <select 
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-slate-900 appearance-none"
                                        value={editingContent.trimestre}
                                        onChange={(e) => setEditingContent({...editingContent, trimestre: parseInt(e.target.value)})}
                                    >
                                        <option value={1}>1º Trimestre</option>
                                        <option value={2}>2º Trimestre</option>
                                        <option value={3}>3º Trimestre</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Orden Maestro</label>
                                    <input 
                                        type="number"
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-slate-900"
                                        value={editingContent.orden}
                                        onChange={(e) => setEditingContent({...editingContent, orden: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowContentModal(false)} className="px-8 font-black rounded-2xl">
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveContent} isLoading={saving} className="px-10 font-black rounded-2xl bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200">
                                Guardar Contenido
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

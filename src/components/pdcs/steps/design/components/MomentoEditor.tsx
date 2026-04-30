'use client';

import React from 'react';
import { TabType } from '@/hooks/useMomentosProceso';
import { TipoFuente } from '@/types';

interface MomentoEditorProps {
    activeTab: TabType;
    activeMomentoConfig: { icon: string; label: string; accent: string; color: string; };
    isSaving: boolean;
    // Práctica
    editingItem: any;
    setEditingItem: (val: any) => void;
    handleSavePractica: () => void;
    // Teoría
    editingTheoryItem: any;
    setEditingTheoryItem: (val: any) => void;
    handleSaveTheory: () => void;
    // Producción
    editingProduccionItem: any;
    setEditingProduccionItem: (val: any) => void;
    handleSaveProduccion: () => void;
    // Valoración
    editingValoracionItem: any;
    setEditingValoracionItem: (val: any) => void;
    handleSaveValoracion: () => void;
    // Adaptaciones
    editingAdaptacionItem: any;
    setEditingAdaptacionItem: (val: any) => void;
    handleSaveAdaptacion: () => void;
    // Recursos
    editingRecursoItem: any;
    setEditingRecursoItem: (val: any) => void;
    handleSaveRecurso: () => void;
    // Fuentes
    editingFuenteItem: any;
    setEditingFuenteItem: (val: any) => void;
    handleSaveMiFuente: () => void;
    isEditingExistingFuente: boolean;
    /** Catálogo de tipos de fuente cargado desde tipo_fuente */
    tiposFuenteCatalogo: TipoFuente[];
}

const ACCENT_MAP: Record<string, { gradientStyle: string; ring: string; badge: string; saveLabel: string }> = {
    'rose-600': { gradientStyle: 'linear-gradient(to right, #f43f5e, #db2777)', ring: 'focus:ring-rose-100', badge: 'bg-rose-50 text-rose-600 border-rose-100', saveLabel: 'Guardar Práctica' },
    'indigo-600': { gradientStyle: 'linear-gradient(to right, #6366f1, #4f46e5)', ring: 'focus:ring-indigo-100', badge: 'bg-indigo-50 text-indigo-600 border-indigo-100', saveLabel: 'Guardar Estrategia' },
    'amber-600': { gradientStyle: 'linear-gradient(to right, #f59e0b, #ea580c)', ring: 'focus:ring-amber-100', badge: 'bg-amber-50 text-amber-600 border-amber-100', saveLabel: 'Guardar Producto' },
    'emerald-600': { gradientStyle: 'linear-gradient(to right, #10b981, #0d9488)', ring: 'focus:ring-emerald-100', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100', saveLabel: 'Guardar Valoración' },
    'violet-600': { gradientStyle: 'linear-gradient(to right, #8b5cf6, #7c3aed)', ring: 'focus:ring-violet-100', badge: 'bg-violet-50 text-violet-600 border-violet-100', saveLabel: 'Guardar Adaptación' },
    'sky-600': { gradientStyle: 'linear-gradient(to right, #0ea5e9, #0284c7)', ring: 'focus:ring-sky-100', badge: 'bg-sky-50 text-sky-600 border-sky-100', saveLabel: 'Guardar Recurso' },
    'orange-600': { gradientStyle: 'linear-gradient(to right, #f97316, #d97706)', ring: 'focus:ring-orange-100', badge: 'bg-orange-50 text-orange-600 border-orange-100', saveLabel: 'Guardar Fuente en Biblioteca' },
};

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1">{label}</label>
            {children}
        </div>
    );
}

function SaveButton({ gradientStyle, label, onClick, isSaving }: { gradientStyle: string; label: string; onClick: () => void; isSaving: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={isSaving}
            style={{ background: gradientStyle }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
            <span className="material-symbols-rounded text-base">{isSaving ? 'hourglass_top' : 'save'}</span>
            {isSaving ? 'Guardando...' : label}
        </button>
    );
}

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300";
const textareaCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all resize-none leading-relaxed placeholder:text-slate-300";
const selectCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer appearance-none";

export function MomentoEditor(props: MomentoEditorProps) {
    const {
        activeTab, activeMomentoConfig, isSaving,
        editingItem, setEditingItem, handleSavePractica,
        editingTheoryItem, setEditingTheoryItem, handleSaveTheory,
        editingProduccionItem, setEditingProduccionItem, handleSaveProduccion,
        editingValoracionItem, setEditingValoracionItem, handleSaveValoracion,
        editingAdaptacionItem, setEditingAdaptacionItem, handleSaveAdaptacion,
        editingRecursoItem, setEditingRecursoItem, handleSaveRecurso,
        editingFuenteItem, setEditingFuenteItem, handleSaveMiFuente,
        isEditingExistingFuente, tiposFuenteCatalogo,
    } = props;

    const accentKey = activeMomentoConfig.accent || 'blue-600';
    const accentCfg = ACCENT_MAP[accentKey] || ACCENT_MAP['blue-600'];


    return (
        <div className="lg:col-span-5 flex flex-col min-h-0">
            {/* Editor Header */}
            <div
                style={{ background: accentCfg.gradientStyle }}
                className="flex items-center gap-4 px-6 py-4 rounded-t-2xl"
            >
                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
                    <span className="material-symbols-rounded text-xl text-white">{activeMomentoConfig.icon}</span>
                </div>
                <div>
                    <h2 className="text-sm font-black text-white uppercase tracking-wider">
                        {activeTab === 'fuentes'
                            ? (isEditingExistingFuente ? 'Editando Fuente' : 'Nueva Fuente')
                            : `Editor de ${activeMomentoConfig.label}`}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="size-1.5 rounded-full bg-white/60 animate-pulse" />
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Sesión Activa</span>
                    </div>
                </div>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto bg-white border border-t-0 border-slate-100 rounded-b-2xl p-6 space-y-5 custom-scrollbar">


                {/* ── PRÁCTICA ── */}
                {activeTab === 'practica' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <FieldGroup label="Título de la Actividad">
                            <input className={inputCls} type="text"
                                placeholder="Nombre de la práctica..."
                                value={editingItem.nombre_practica}
                                onChange={(e) => setEditingItem({ ...editingItem, nombre_practica: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Preguntas Activadoras">
                            <textarea className={`${textareaCls} min-h-[100px]`}
                                    placeholder="¿Qué preguntas iniciarán el diálogo con los estudiantes?"
                                    value={editingItem.preguntas}
                                    onChange={(e) => setEditingItem({ ...editingItem, preguntas: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Descripción / Redacción">
                            <textarea className={`${textareaCls} min-h-[350px]`}
                                    placeholder="Describe paso a paso cómo se llevará a cabo..."
                                    value={editingItem.descripcion || editingItem.redactado || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, descripcion: e.target.value, redactado: e.target.value })} />
                        </FieldGroup>
                        <SaveButton gradientStyle={accentCfg.gradientStyle} label={accentCfg.saveLabel} onClick={handleSavePractica} isSaving={isSaving} />
                    </div>
                )}

                {/* ── TEORÍA ── */}
                {activeTab === 'teoria' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <FieldGroup label="Nombre de la Estrategia">
                            <input className={inputCls} type="text"
                                placeholder="Nombre de la estrategia teórica..."
                                value={editingTheoryItem.nombre_estrategia_teorica}
                                onChange={(e) => setEditingTheoryItem({ ...editingTheoryItem, nombre_estrategia_teorica: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Redacción de la Estrategia">
                            <textarea className={`${textareaCls} min-h-[450px]`}
                                    placeholder="Desarrolla la estrategia teórica en detalle..."
                                    value={editingTheoryItem.redactado}
                                    onChange={(e) => setEditingTheoryItem({ ...editingTheoryItem, redactado: e.target.value })} />
                        </FieldGroup>
                        <SaveButton gradientStyle={accentCfg.gradientStyle} label={accentCfg.saveLabel} onClick={handleSaveTheory} isSaving={isSaving} />
                    </div>
                )}

                {/* ── PRODUCCIÓN ── */}
                {activeTab === 'produccion' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <FieldGroup label="Producto a Obtener">
                            <input className={inputCls} type="text"
                                placeholder="¿Qué producto crearán los estudiantes?"
                                value={editingProduccionItem.nombre_produccion}
                                onChange={(e) => setEditingProduccionItem({ ...editingProduccionItem, nombre_produccion: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Descripción / Consigna">
                            <textarea className={`${textareaCls} min-h-[350px]`}
                                    placeholder="Describe las instrucciones y consigna para los estudiantes..."
                                    value={editingProduccionItem.redactado}
                                    onChange={(e) => setEditingProduccionItem({ ...editingProduccionItem, redactado: e.target.value })} />
                        </FieldGroup>
                        <div className="grid grid-cols-1 gap-4">
                            <FieldGroup label="Instrumento Sugerido">
                                <input className={inputCls} type="text"
                                    placeholder="Ej: Rúbrica, lista..."
                                    value={editingProduccionItem.instrumento || ''}
                                    onChange={(e) => setEditingProduccionItem({ ...editingProduccionItem, instrumento: e.target.value })} />
                            </FieldGroup>
                        </div>
                        <SaveButton gradientStyle={accentCfg.gradientStyle} label={accentCfg.saveLabel} onClick={handleSaveProduccion} isSaving={isSaving} />
                    </div>
                )}

                {/* ── VALORACIÓN ── */}
                {activeTab === 'valoracion' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <div className="grid grid-cols-1 gap-4">
                            <FieldGroup label="Categoría">
                                <input className={inputCls} type="text"
                                    placeholder="Ej: Saber, Hacer..."
                                    value={editingValoracionItem.categoria}
                                    onChange={(e) => setEditingValoracionItem({ ...editingValoracionItem, categoria: e.target.value })} />
                            </FieldGroup>
                        </div>
                        <FieldGroup label="Preguntas de Reflexión">
                            <textarea className={`${textareaCls} min-h-[110px]`}
                                    placeholder="¿Qué preguntas guiarán la reflexión del estudiante?"
                                    value={editingValoracionItem.preguntas}
                                    onChange={(e) => setEditingValoracionItem({ ...editingValoracionItem, preguntas: e.target.value })} />
                        </FieldGroup>
                        <div className="grid grid-cols-1 gap-4">
                            <FieldGroup label="Instrumento">
                                <input className={inputCls} type="text"
                                    placeholder="Instrumento sugerido..."
                                    value={editingValoracionItem.instrumento || ''}
                                    onChange={(e) => setEditingValoracionItem({ ...editingValoracionItem, instrumento: e.target.value })} />
                            </FieldGroup>
                        </div>
                        <SaveButton gradientStyle={accentCfg.gradientStyle} label={accentCfg.saveLabel} onClick={handleSaveValoracion} isSaving={isSaving} />
                    </div>
                )}

                {/* ── ADAPTACIONES ── */}
                {activeTab === 'adaptaciones' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <FieldGroup label="Nombre de la Adaptación">
                            <input className={inputCls} type="text"
                                placeholder="Nombre de la adaptación curricular..."
                                value={editingAdaptacionItem.nombre_adaptacion || ''}
                                onChange={(e) => setEditingAdaptacionItem({ ...editingAdaptacionItem, nombre_adaptacion: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Redacción / Descripción">
                            <textarea className={`${textareaCls} min-h-[400px]`}
                                    placeholder="Describe cómo se implementará esta adaptación..."
                                    value={editingAdaptacionItem.redactado || ''}
                                    onChange={(e) => setEditingAdaptacionItem({ ...editingAdaptacionItem, redactado: e.target.value })} />
                        </FieldGroup>
                        <SaveButton gradientStyle={accentCfg.gradientStyle} label={accentCfg.saveLabel} onClick={handleSaveAdaptacion} isSaving={isSaving} />
                    </div>
                )}

                {/* ── RECURSOS ── */}
                {activeTab === 'recursos' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
                        <FieldGroup label="Recurso">
                            <input className={inputCls} type="text"
                                placeholder="Nombre o descripción del recurso..."
                                value={editingRecursoItem.recursos || ''}
                                onChange={(e) => setEditingRecursoItem({ ...editingRecursoItem, recursos: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Redacción / Uso Pedagógico">
                            <textarea className={`${textareaCls} min-h-[400px]`}
                                    placeholder="¿Cómo se utilizará este recurso en el proceso pedagógico?"
                                    value={editingRecursoItem.redactado || ''}
                                    onChange={(e) => setEditingRecursoItem({ ...editingRecursoItem, redactado: e.target.value })} />
                        </FieldGroup>
                        <SaveButton gradientStyle={accentCfg.gradientStyle} label={accentCfg.saveLabel} onClick={handleSaveRecurso} isSaving={isSaving} />
                    </div>
                )}

                {/* ── FUENTES ── */}
                {activeTab === 'fuentes' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400">
                        {isEditingExistingFuente && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                                <span className="material-symbols-rounded text-sm text-orange-500">edit_note</span>
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Editando fuente existente</p>
                            </div>
                        )}
                        <FieldGroup label="Tipo de Fuente">
                            <div className="relative">
                                <select
                                    className={selectCls}
                                    value={editingFuenteItem.tipo ?? ''}
                                    onChange={(e) => setEditingFuenteItem({ ...editingFuenteItem, tipo: e.target.value || null })}
                                >
                                    <option value="">Seleccionar tipo...</option>
                                    {tiposFuenteCatalogo.map(t => (
                                        <option key={t.id_tipo_fuente} value={String(t.id_tipo_fuente)}>{t.tipo_fuente}</option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-slate-400">expand_more</span>
                            </div>
                        </FieldGroup>
                        <FieldGroup label="Título de la Fuente">
                            <input className={inputCls} type="text"
                                placeholder="Título del libro, sitio web, video..."
                                value={editingFuenteItem.titulo_fuente || ''}
                                onChange={(e) => setEditingFuenteItem({ ...editingFuenteItem, titulo_fuente: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Autor">
                            <input className={inputCls} type="text"
                                placeholder="Apellido, Nombre o nombre de organización..."
                                value={editingFuenteItem.autor || ''}
                                onChange={(e) => setEditingFuenteItem({ ...editingFuenteItem, autor: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Año">
                            <input className={inputCls} type="text"
                                placeholder="Ej: 2024"
                                value={editingFuenteItem.anio || ''}
                                onChange={(e) => setEditingFuenteItem({ ...editingFuenteItem, anio: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="URL">
                            <input className={inputCls} type="text"
                                placeholder="https://..."
                                value={editingFuenteItem.url || ''}
                                onChange={(e) => setEditingFuenteItem({ ...editingFuenteItem, url: e.target.value })} />
                        </FieldGroup>
                        <FieldGroup label="Detalle / Descripción">
                            <textarea className={`${textareaCls} min-h-[100px]`}
                                placeholder="Descripción adicional, capítulo, páginas, notas..."
                                value={editingFuenteItem.detalle || ''}
                                onChange={(e) => setEditingFuenteItem({ ...editingFuenteItem, detalle: e.target.value })} />
                        </FieldGroup>
                        <SaveButton gradientStyle={accentCfg.gradientStyle} label={accentCfg.saveLabel} onClick={handleSaveMiFuente} isSaving={isSaving} />
                    </div>
                )}

            </div>
        </div>
    );
}

'use client';

import React from 'react';
import { usePdcRefinement } from '@/hooks/usePdcRefinement';
import { TONOS_LABEL, TonoRedaccion } from '@/lib/ai/promptTemplates';
import { usePdcWizard } from '@/contexts/PdcWizardContext';
import { PDC_TYPES } from '@/hooks/usePdcWizardController';

export function Step10AIFinalization() {
    const { 
        isRefining, 
        progress, 
        selectedTone, 
        setSelectedTone, 
        correctionDepth,
        setCorrectionDepth,
        startRefinement 
    } = usePdcRefinement();
    
    const { selectedType, pdcName } = usePdcWizard();
    
    // Configuración visual según el tipo de PDC
    const typeConfig = PDC_TYPES.find(t => t.id === selectedType) || PDC_TYPES[1];

    const depthOptions = [
        { id: 'Solo errores', label: 'Solo errores de redacción', icon: 'spellcheck', desc: 'Corrige ortografía y gramática sin alterar tu estilo.' },
        { id: 'Sugerir moderadamente', label: 'Sugerir moderadamente', icon: 'edit_note', desc: 'Mejora la fluidez y el vocabulario manteniendo tu esencia.' },
        { id: 'Sugerir ampliamente', label: 'Sugerir ampliamente', icon: 'auto_fix_high', desc: 'Reestructura secciones completas para máxima profesionalidad.' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            {/* Header Section */}
            <div className="text-center space-y-6 py-8 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 rounded-[5rem] blur-3xl" />
                
                <div className={`inline-flex items-center justify-center size-20 rounded-[2rem] ${typeConfig.bgColor} ${typeConfig.textColor} mb-2 shadow-xl shadow-blue-500/10 border-2 ${typeConfig.borderColor} animate-bounce-slow`}>
                    <span className="material-symbols-rounded text-4xl font-black">auto_fix_high</span>
                </div>
                
                <div className="space-y-2">
                    <p className="text-[12px] font-black text-blue-600 uppercase tracking-[0.6em]">Paso 11 • Refinamiento Final</p>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">
                         Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">Optimización</span> Pedagógica
                    </h1>
                    <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        Personaliza cómo nuestra IA perfeccionará tu planificación antes de finalizar.
                    </p>
                </div>
            </div>

            {/* main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                
                {/* Left Side: Selections */}
                <div className="xl:col-span-8 space-y-12">
                    
                    {/* Tono Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="size-10 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-rounded font-bold text-xl">palette</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">1. Tono de Redacción</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(Object.keys(TONOS_LABEL) as TonoRedaccion[]).map((tone) => (
                                <button
                                    key={tone}
                                    onClick={() => setSelectedTone(tone)}
                                    disabled={isRefining}
                                    className={`group relative flex items-start gap-4 p-5 rounded-[2rem] border-2 transition-all duration-500 text-left overflow-hidden ${
                                        selectedTone === tone 
                                        ? `bg-white ${typeConfig.borderColor} shadow-xl scale-[1.02] border-blue-500` 
                                        : 'bg-slate-50/50 border-transparent hover:bg-white hover:shadow-lg hover:border-slate-200'
                                    }`}
                                >
                                    <div className={`flex-shrink-0 size-12 rounded-xl flex items-center justify-center shadow-md transition-all duration-500 ${
                                        selectedTone === tone ? typeConfig.bgColor : 'bg-white'
                                    }`}>
                                        <span className={`material-symbols-rounded text-xl font-bold ${
                                            selectedTone === tone ? typeConfig.textColor : 'text-slate-400 group-hover:text-slate-600'
                                        }`}>
                                            {tone === 'Motivacional-afectivo' ? 'favorite' :
                                             tone === 'Instructivo-operativo' ? 'assignment' :
                                             tone === 'Técnico-pedagógico' ? 'verified' :
                                             tone === 'Reflexivo-metacognitivo' ? 'psychology' : 'auto_awesome'}
                                        </span>
                                    </div>
                                    <div className="space-y-1 pr-4">
                                        <h4 className={`text-lg font-black tracking-tight ${selectedTone === tone ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {TONOS_LABEL[tone]}
                                        </h4>
                                        <p className="text-[12px] text-slate-500 font-medium leading-snug">
                                            {tone === 'Motivacional-afectivo' && 'Lenguaje cálido e inspirador.'}
                                            {tone === 'Instructivo-operativo' && 'Claro, directo y ejecutivo.'}
                                            {tone === 'Técnico-pedagógico' && 'Rigor académico y docente.'}
                                            {tone === 'Reflexivo-metacognitivo' && 'Fomenta el pensamiento crítico.'}
                                            {tone === 'Lúdico-narrativo' && 'Dinámico, creativo y gamificado.'}
                                        </p>
                                    </div>
                                    {selectedTone === tone && (
                                        <div className="absolute top-4 right-4">
                                            <span className={`material-symbols-rounded text-xl font-black animate-in zoom-in duration-300 ${typeConfig.textColor}`}>check_circle</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Depth Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-2">
                            <div className="size-10 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                                <span className="material-symbols-rounded font-bold text-xl">layers</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">2. Profundidad de Corrección</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {depthOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setCorrectionDepth(option.id)}
                                    disabled={isRefining}
                                    className={`group relative flex items-center gap-6 p-6 rounded-[2.5rem] border-2 transition-all duration-500 text-left overflow-hidden ${
                                        correctionDepth === option.id 
                                        ? `bg-white ${typeConfig.borderColor} shadow-xl scale-[1.01] border-amber-500` 
                                        : 'bg-slate-50/50 border-transparent hover:bg-white hover:shadow-lg hover:border-slate-200'
                                    }`}
                                >
                                    <div className={`flex-shrink-0 size-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${
                                        correctionDepth === option.id ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'
                                    }`}>
                                        <span className="material-symbols-rounded text-2xl font-bold">
                                            {option.icon}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className={`text-xl font-black tracking-tight ${correctionDepth === option.id ? 'text-slate-900' : 'text-slate-600'}`}>
                                            {option.label}
                                        </h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                            {option.desc}
                                        </p>
                                    </div>
                                    {correctionDepth === option.id && (
                                        <div className="absolute top-6 right-8">
                                            <span className="material-symbols-rounded font-black animate-in zoom-in duration-300 text-amber-500">check_circle</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Action and Progress */}
                <div className="xl:col-span-4 space-y-8 sticky top-8">
                    <div className="flex items-center gap-4 px-2">
                        <div className="size-10 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-rounded font-bold text-xl">rocket_launch</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">3. Ejecutar</h3>
                    </div>
                    
                    {/* Action Card */}
                    <div className="bg-slate-900 rounded-[3.5rem] p-10 border-none shadow-2xl shadow-slate-900/40 space-y-8 relative overflow-hidden group">
                        <div className={`absolute -right-20 -top-20 size-80 rounded-full opacity-[0.08] ${typeConfig.bgColor} blur-3xl group-hover:scale-125 transition-transform duration-1000`} />
                        
                        <div className="space-y-4 relative z-10">
                            <h4 className="font-black text-2xl text-white tracking-tight">
                                Consolidación Final
                            </h4>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                                "Se procesarán objetivos, momentos, recursos y adaptaciones para garantizar coherencia en <strong>{pdcName || 'tu PDC'}</strong>."
                            </p>
                        </div>

                        {/* Progress Console */}
                        <div className="bg-black/50 backdrop-blur-md rounded-3xl p-6 h-72 overflow-y-auto space-y-3 font-mono text-[11px] scrollbar-hide border border-white/5 shadow-inner">
                            {progress.length === 0 ? (
                                <div className="text-slate-600 italic flex flex-col items-center justify-center h-full gap-4 opacity-40">
                                    <span className="material-symbols-rounded text-5xl">terminal</span>
                                    <span className="font-black tracking-widest uppercase">Listo para iniciar</span>
                                </div>
                            ) : (
                                progress.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 py-1 animate-in slide-in-from-left-2 duration-300 ${msg.startsWith('✅') ? 'text-emerald-400 font-bold' : msg.startsWith('❌') ? 'text-rose-400' : 'text-blue-300'}`}>
                                        <span className="text-slate-700 font-bold">[{new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}]</span>
                                        <span className="leading-relaxed">{msg}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Master Button */}
                        <button
                            onClick={startRefinement}
                            disabled={isRefining}
                            className={`w-full group relative overflow-hidden flex items-center justify-center gap-4 py-6 rounded-[2rem] text-white font-black uppercase tracking-widest transition-all duration-700 shadow-2xl ${
                                isRefining 
                                ? 'bg-slate-800 cursor-not-allowed opacity-50' 
                                : `bg-gradient-to-r ${typeConfig.color === 'rose' ? 'from-rose-500 to-pink-700 shadow-rose-500/30' : 
                                    typeConfig.color === 'amber' ? 'from-amber-500 to-orange-700 shadow-amber-500/30' :
                                    typeConfig.color === 'indigo' ? 'from-indigo-600 to-violet-800 shadow-indigo-600/30' :
                                    'from-emerald-500 to-teal-700 shadow-emerald-500/30'} hover:scale-[1.02] active:scale-[0.98]`
                            }`}
                        >
                            {isRefining && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />}
                            <span className={`material-symbols-rounded text-2xl ${isRefining ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`}>
                                {isRefining ? 'sync' : 'bolt'}
                            </span>
                            <span>{isRefining ? 'Procesando...' : 'Iniciar Optimización'}</span>
                        </button>
                    </div>

                    <div className="bg-blue-50/50 rounded-[2rem] p-6 flex gap-5 border border-blue-100/50 shadow-sm">
                        <div className="size-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-rounded font-bold">lightbulb</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            <strong className="text-blue-700">Tip:</strong> La optimización puede tardar unos segundos dependiendo del tamaño de tu planificación.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

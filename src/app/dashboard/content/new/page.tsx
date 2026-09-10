'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useProfile } from '@/contexts/ProfileContext';
import { db } from '@/lib/database';
import { ContentService } from '@/services/content.service';
import { AreasService } from '@/services/areas.service';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { Check, ChevronRight, FileText, Settings, Sparkles, AlertCircle, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Dynamic import in the handler to avoid SSR issues with file-saver and docx

// Tareas:
// - Instalar remark-math y rehype-katex
// - Componentes separados si crece demasiado

export default function ContentWizardPage() {
    const router = useRouter();
    const { profile } = useProfile();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [areas, setAreas] = useState<any[]>([]);
    const [selectedAreaId, setSelectedAreaId] = useState<string>('');
    const [temasPadre, setTemasPadre] = useState<any[]>([]);
    const [selectedTemaId, setSelectedTemaId] = useState<number | ''>('');
    
    const [pdfContext, setPdfContext] = useState<string>('');
    const [estructura, setEstructura] = useState('Descriptiva (Introducción -> Desarrollo -> Conclusión)');
    const [componentes, setComponentes] = useState<string[]>(['Ejemplos Cotidianos']);
    const [extras, setExtras] = useState<string[]>([]);
    const [profundidad, setProfundidad] = useState('Normal');

    const [generatedContent, setGeneratedContent] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    
    useEffect(() => {
        if (!profile?.id) return;
        const fetchAreas = async () => {
            const res = await AreasService.getAreas(profile.id);
            if (res.success && res.data) {
                setAreas(res.data);
                
                // Si viene de la URL, autoseleccionar el área
                const urlParams = new URLSearchParams(window.location.search);
                const areaParam = urlParams.get('areaId');
                if (areaParam && res.data.some(a => a.id === areaParam)) {
                    setSelectedAreaId(areaParam);
                }
            }
        };
        fetchAreas();
    }, [profile?.id]);

    useEffect(() => {
        if (!selectedAreaId) return;
        const fetchTemas = async () => {
            // Obtener temas padre (sin padre_id) para el area seleccionada
            const { data } = await db
                .from('contenidos_usuario')
                .select('id, titulo')
                .eq('area_trabajo_id', selectedAreaId)
                .is('padre_id', null)
                .order('orden');
            if (data) setTemasPadre(data);
        };
        fetchTemas();
    }, [selectedAreaId]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const temaSeleccionado = temasPadre.find(t => t.id === selectedTemaId);
            if (!temaSeleccionado) throw new Error("Tema no seleccionado");

            // 1. Obtener contexto (Subtemas, PDC Snapshot)
            const { subtemas, pdcSnapshot } = await ContentService.getContextForGeneration(selectedAreaId, Number(selectedTemaId));
            
            const areaSeleccionada = areas.find(a => a.id === selectedAreaId);
            const cursoInfo = areaSeleccionada 
                ? `${areaSeleccionada.area_conocimiento?.grado?.nombre} de ${areaSeleccionada.area_conocimiento?.grado?.nivel?.nombre}`
                : 'Estudiantes';

            // 2. Llamar a la IA
            const result = await ContentService.generateContent(
                temaSeleccionado.titulo,
                subtemas,
                pdcSnapshot,
                pdfContext,
                estructura,
                componentes,
                extras,
                profundidad,
                cursoInfo
            );
            
            setGeneratedContent(result);
            setStep(3);
        } catch (error: any) {
            console.error("Error generating content:", error);
            alert("Error al generar contenido: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            alert('Por favor, selecciona un archivo PDF válido.');
            return;
        }

        setIsExtracting(true);
        try {
            const extractedText = await extractTextFromPDF(file);
            setPdfContext((prev) => prev ? prev + '\n\n--- Texto Extraído del PDF ---\n\n' + extractedText : extractedText);
            alert('PDF procesado exitosamente. Puedes revisar el texto extraído en el cuadro a continuación.');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Ocurrió un error al procesar el PDF.');
        } finally {
            setIsExtracting(false);
            // Reset input so the same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleSaveAndExport = async () => {
        try {
            setLoading(true);
            const temaSeleccionado = temasPadre.find(t => t.id === selectedTemaId);
            
            // 1. Guardar en Base de Datos
            await ContentService.saveContent({
                docente_id: profile!.id,
                area_trabajo_id: selectedAreaId,
                tema_padre_id: Number(selectedTemaId),
                titulo_tema: temaSeleccionado.titulo,
                cuerpo_contenido: generatedContent,
                estado: 'Finalizado',
                config_usada: { estructura, componentes, extras }
            });
            
            // 2. Exportar a Word (.docx)
            const { exportMarkdownToWord } = await import('@/lib/markdownExport.service');
            await exportMarkdownToWord(generatedContent, profile!.nombres + ' ' + profile!.apellidos || 'Docente', temaSeleccionado.titulo);
            
            alert("Contenido guardado y exportado exitosamente.");
            router.push('/dashboard');
        } catch (error: any) {
            console.error(error);
            alert("Error al guardar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleArrayItem = (setter: any, array: string[], item: string) => {
        if (array.includes(item)) setter(array.filter(i => i !== item));
        else setter([...array, item]);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-24">
            <PageHeader 
                title="Generador de Contenidos" 
                subtitle="Crea guías didácticas y material de apoyo basado en tu PDC."
            />

            {/* Stepper */}
            <div className="flex items-center justify-between mb-8">
                {[
                    { num: 1, label: 'Contexto Base', icon: <FileText size={18}/> },
                    { num: 2, label: 'Diseño Pedagógico', icon: <Settings size={18}/> },
                    { num: 3, label: 'Vista Previa', icon: <Sparkles size={18}/> },
                ].map((s, i) => (
                    <div key={s.num} className="flex flex-col items-center flex-1 relative">
                        <div className={`size-10 rounded-full flex items-center justify-center font-black text-sm relative z-10 transition-colors ${step >= s.num ? 'bg-emerald-500 text-white shadow-glow-emerald' : 'bg-slate-100 text-slate-400'}`}>
                            {s.icon}
                        </div>
                        <span className={`text-xs font-black mt-2 uppercase tracking-widest ${step >= s.num ? 'text-emerald-700' : 'text-slate-400'}`}>{s.label}</span>
                        {i < 2 && <div className={`absolute top-5 left-1/2 w-full h-1 -translate-y-1/2 ${step > s.num ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Contexto Base */}
            {step === 1 && (
                <Card className="p-8 space-y-6">
                    <h2 className="text-xl font-black text-slate-800">Selección de Contexto</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Área de Trabajo</label>
                            <select 
                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                value={selectedAreaId}
                                onChange={e => setSelectedAreaId(e.target.value)}
                            >
                                <option value="">Selecciona un área...</option>
                                {areas.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.area_conocimiento?.nombre} - {a.area_conocimiento?.grado?.nombre} de {a.area_conocimiento?.grado?.nivel?.nombre} | Paralelo {a.paralelos?.map((p: any) => p.nombre).join(', ') || 'N/A'} | {a.unidad_educativa?.nombre} | Turno {a.turno?.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAreaId && (
                            <div className="animate-in fade-in slide-in-from-top-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Tema Padre (El contenido incluirá todos sus subtemas)</label>
                                <select 
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                                    value={selectedTemaId}
                                    onChange={e => setSelectedTemaId(Number(e.target.value))}
                                >
                                    <option value="">Selecciona un tema base...</option>
                                    {temasPadre.map(t => (
                                        <option key={t.id} value={t.id}>{t.titulo}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Contexto Extra (Opcional)</label>
                            <p className="text-xs text-slate-500 mb-3">Sube un PDF para extraer automáticamente la información teórica, o pega/escribe tus apuntes directamente.</p>
                            
                            <div className="mb-4">
                                <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isExtracting ? 'border-emerald-300 bg-emerald-50 opacity-70' : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                                    <div className="flex flex-col items-center">
                                        <UploadCloud className={`${isExtracting ? 'text-emerald-500 animate-bounce' : 'text-slate-400 mb-2'}`} size={24} />
                                        <span className={`text-sm font-bold ${isExtracting ? 'text-emerald-600 mt-2' : 'text-slate-600'}`}>
                                            {isExtracting ? 'Procesando PDF...' : 'Subir Archivo PDF'}
                                        </span>
                                    </div>
                                    <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isExtracting} />
                                </label>
                            </div>

                            <textarea 
                                rows={6}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                placeholder="Pega aquí el contenido extra o edita el texto extraído del PDF..."
                                value={pdfContext}
                                onChange={e => setPdfContext(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button 
                            onClick={() => setStep(2)} 
                            disabled={!selectedAreaId || !selectedTemaId}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-bold"
                        >
                            Siguiente Paso <ChevronRight size={18} className="ml-2"/>
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 2: Diseño Pedagógico */}
            {step === 2 && (
                <Card className="p-8 space-y-8">
                    <h2 className="text-xl font-black text-slate-800">Configuración Pedagógica</h2>
                    
                    {/* Estructura */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-4">Estructura del Documento</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Descriptiva (Introducción -> Desarrollo -> Conclusión)', 'Explicativa (Concepto -> Casos de Uso -> Ejemplos)', 'Basada en Momentos (Reflexión Inicial -> Teoría -> Aplicación Práctica)'].map(opt => (
                                <div 
                                    key={opt}
                                    onClick={() => setEstructura(opt)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${estructura === opt ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-emerald-200 bg-white'}`}
                                >
                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${estructura === opt ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                        {estructura === opt && <Check size={12} className="text-white"/>}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 leading-tight">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profundidad */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-4">Profundidad y Longitud</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['Corto', 'Normal', 'Largo/Profundo'].map(opt => (
                                <div 
                                    key={opt}
                                    onClick={() => setProfundidad(opt)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${profundidad === opt ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-emerald-200 bg-white'}`}
                                >
                                    <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${profundidad === opt ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`}>
                                        {profundidad === opt && <Check size={12} className="text-white"/>}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 leading-tight">{opt}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Componentes */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-4">Componentes a Incluir</label>
                        <div className="flex flex-wrap gap-3">
                            {['Ejemplos Cotidianos', 'Glosario de Términos', 'Estudios de Caso', 'Curiosidades (Sabías que...)', 'Resumen Ejecutivo'].map(opt => (
                                <div 
                                    key={opt}
                                    onClick={() => toggleArrayItem(setComponentes, componentes, opt)}
                                    className={`px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2 ${componentes.includes(opt) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                >
                                    {componentes.includes(opt) && <Check size={14} />}
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Extras */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-4">Toques Extra (Rompehielos y Reflexión)</label>
                        <div className="flex flex-wrap gap-3">
                            {['Frase Célebre', 'Dato Curioso / Chiste', 'Versículo Bíblico (Valores)'].map(opt => (
                                <div 
                                    key={opt}
                                    onClick={() => toggleArrayItem(setExtras, extras, opt)}
                                    className={`px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-bold flex items-center gap-2 ${extras.includes(opt) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
                                >
                                    {extras.includes(opt) && <Check size={14} />}
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-slate-100">
                        <Button 
                            variant="outline"
                            onClick={() => setStep(1)} 
                            className="rounded-xl px-8 h-12 font-bold"
                        >
                            Atrás
                        </Button>
                        <Button 
                            onClick={handleGenerate} 
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 font-bold shadow-glow-emerald"
                        >
                            {loading ? (
                                <><Sparkles size={18} className="mr-2 animate-spin"/> Generando con IA...</>
                            ) : (
                                <><Sparkles size={18} className="mr-2"/> Generar Contenido</>
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Step 3: Vista Previa y Edición */}
            {step === 3 && (
                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20}/>
                        <div>
                            <h4 className="font-bold text-amber-800">Vista Previa Interactiva</h4>
                            <p className="text-sm text-amber-700 mt-1">Revisa el contenido generado. Puedes editar el texto directamente en el panel izquierdo. Las fórmulas matemáticas encerradas en $$ se renderizarán correctamente en la vista previa y en la exportación a Word.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
                        {/* Editor Markdown */}
                        <Card className="flex flex-col overflow-hidden border-slate-200 shadow-soft">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Editor Markdown (Puedes Modificar)</span>
                            </div>
                            <textarea 
                                className="flex-1 w-full p-6 resize-none outline-none font-mono text-sm bg-white text-slate-700 leading-relaxed"
                                value={generatedContent}
                                onChange={e => setGeneratedContent(e.target.value)}
                            />
                        </Card>

                        {/* Preview */}
                        <Card className="flex flex-col overflow-hidden border-slate-200 shadow-soft">
                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Vista Previa Renderizada</span>
                            </div>
                            <div className="flex-1 w-full p-8 overflow-y-auto bg-white prose prose-slate prose-emerald max-w-none">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkMath]} 
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {generatedContent}
                                </ReactMarkdown>
                            </div>
                        </Card>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button 
                            variant="outline"
                            onClick={() => setStep(2)} 
                            className="rounded-xl px-8 h-12 font-bold"
                            disabled={loading}
                        >
                            Atrás
                        </Button>
                        <Button 
                            onClick={handleSaveAndExport} 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-12 font-bold shadow-glow-blue"
                        >
                            {loading ? 'Guardando...' : 'Guardar y Exportar a Word (.docx)'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

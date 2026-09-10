'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { X, Gavel, Package, Link as LinkIcon, Hash, Info, FileText } from 'lucide-react';

interface ResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    initialData?: any;
    tipo: 'normativa' | 'bien';
}

export function ResourceModal({ isOpen, onClose, onSave, initialData, tipo }: ResourceModalProps) {
    const [formData, setFormData] = useState({
        titulo_nombre: '',
        descripcion: '',
        archivo_url: '',
        cantidad: 1,
        estado_bien: 'Bueno'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                titulo_nombre: initialData.titulo_nombre || '',
                descripcion: initialData.descripcion || '',
                archivo_url: initialData.archivo_url || '',
                cantidad: initialData.cantidad || 1,
                estado_bien: initialData.estado_bien || 'Bueno'
            });
        } else {
            setFormData({
                titulo_nombre: '',
                descripcion: '',
                archivo_url: '',
                cantidad: 1,
                estado_bien: 'Bueno'
            });
        }
    }, [initialData, isOpen]);

    const isNormativa = tipo === 'normativa';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...initialData, // keep ID if it's editing
            tipo,
            titulo_nombre: formData.titulo_nombre,
            descripcion: formData.descripcion,
            // Solo mandamos URL si es normativa
            archivo_url: isNormativa ? formData.archivo_url : null,
            // Solo mandamos cantidad y estado si es bien
            cantidad: !isNormativa ? Number(formData.cantidad) : null,
            estado_bien: !isNormativa ? formData.estado_bien : null,
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                >
                    <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-xl flex items-center justify-center ${isNormativa ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {isNormativa ? <Gavel className="size-5" /> : <Package className="size-5" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800">
                                    {initialData ? 'Editar' : 'Añadir'} {isNormativa ? 'Normativa' : 'Ítem de Inventario'}
                                </h2>
                                <p className="text-xs font-medium text-slate-500">
                                    Completa los datos solicitados
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                            <X className="size-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                                    <FileText className="size-4 text-slate-400" />
                                    {isNormativa ? 'Título de la Normativa' : 'Nombre del Ítem'}
                                </label>
                                <input 
                                    required
                                    type="text"
                                    value={formData.titulo_nombre}
                                    onChange={(e) => setFormData({...formData, titulo_nombre: e.target.value})}
                                    placeholder={isNormativa ? "Ej. Reglamento Interno 2026" : "Ej. Proyector Epson"}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                                    <Info className="size-4 text-slate-400" />
                                    Descripción (Opcional)
                                </label>
                                <textarea 
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                    placeholder="Detalles adicionales..."
                                    className="w-full min-h-[100px] p-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 resize-none"
                                />
                            </div>

                            {isNormativa ? (
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                                        <LinkIcon className="size-4 text-slate-400" />
                                        URL del Documento
                                    </label>
                                    <input 
                                        type="url"
                                        required
                                        value={formData.archivo_url}
                                        onChange={(e) => setFormData({...formData, archivo_url: e.target.value})}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                    />
                                    <p className="text-[10px] text-slate-500 font-medium mt-1.5 ml-1">
                                        Asegúrate de que el enlace sea público.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                                            <Hash className="size-4 text-slate-400" />
                                            Cantidad
                                        </label>
                                        <input 
                                            type="number"
                                            required
                                            min="1"
                                            value={formData.cantidad}
                                            onChange={(e) => setFormData({...formData, cantidad: Number(e.target.value)})}
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-800"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="flex items-center gap-2 text-sm font-black text-slate-700 mb-2">
                                            <Info className="size-4 text-slate-400" />
                                            Estado
                                        </label>
                                        <select 
                                            required
                                            value={formData.estado_bien}
                                            onChange={(e) => setFormData({...formData, estado_bien: e.target.value})}
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-slate-800 appearance-none"
                                        >
                                            <option value="Bueno">Bueno</option>
                                            <option value="Regular">Regular</option>
                                            <option value="Malo">Malo</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-100">
                            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold">
                                Cancelar
                            </Button>
                            <Button type="submit" className={`rounded-xl font-bold text-white shadow-lg ${isNormativa ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}>
                                {initialData ? 'Actualizar' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

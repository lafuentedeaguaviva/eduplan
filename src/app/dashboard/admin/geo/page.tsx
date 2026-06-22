'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAdminController } from '@/hooks/useAdminController';

export default function AdminGeoPage() {
    const router = useRouter();
    const {
        departments,
        districts,
        loading,
        saving,
        error: controllerError,
        checkAccess,
        loadGeoData,
        saveDepartment,
        deleteDepartment,
        saveDistrict,
        deleteDistrict
    } = useAdminController();

    const [activeTab, setActiveTab] = useState<'depts' | 'districts' | 'units'>('depts');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const {
        units,
        directors,
        loadUnitsData,
        saveUnit,
        deleteUnit
    } = useAdminController();

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                if (activeTab === 'units') {
                    loadUnitsData();
                } else {
                    loadGeoData();
                }
            }
        };
        init();
    }, [activeTab]);

    const openEdit = (item?: any) => {
        if (item) {
            setEditingItem({ ...item });
        } else {
            if (activeTab === 'depts') setEditingItem({ nombre: '' });
            else if (activeTab === 'districts') setEditingItem({ nombre: '', departamento_id: '' });
            else setEditingItem({ nombre: '', distrito_id: '', direccion: '', telefono: '', director_id: '' });
        }
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;
        if (activeTab === 'depts') {
            success = await saveDepartment(editingItem, !!editingItem.id);
        } else if (activeTab === 'districts') {
            success = await saveDistrict(editingItem);
        } else {
            success = await saveUnit(editingItem, !!editingItem.id);
        }

        if (success) {
            setShowModal(false);
            if (activeTab === 'units') loadUnitsData();
            else loadGeoData();
        }
    };

    const filteredDepts = departments.filter(d => d.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredDistricts = districts.filter(d => 
        d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.departamento?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredUnits = units.filter(u => 
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.distrito?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard/admin')} className="size-12 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all group">
                        <span className="material-symbols-rounded text-slate-400 group-hover:text-slate-900 group-hover:-translate-x-1 transition-all">arrow_back</span>
                    </button>
                    <div>
                        <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px] text-emerald-600 bg-emerald-50 border-emerald-100 mb-2">
                           Estructura Institucional
                        </Badge>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic">Sedes y Unidades</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                        <input 
                            type="text" 
                            placeholder={`Buscar ${activeTab === 'depts' ? 'departamento' : activeTab === 'districts' ? 'distrito' : 'unidad'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-soft outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all w-full md:w-80 font-medium"
                        />
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-slate-100 pb-1">
                <button 
                    onClick={() => { setActiveTab('depts'); setSearchTerm(''); }}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'depts' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Departamentos
                    {activeTab === 'depts' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-full animate-in slide-in-from-left-2" />}
                </button>
                <button 
                    onClick={() => { setActiveTab('districts'); setSearchTerm(''); }}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'districts' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Distritos
                    {activeTab === 'districts' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-full animate-in slide-in-from-left-2" />}
                </button>
                <button 
                    onClick={() => { setActiveTab('units'); setSearchTerm(''); }}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'units' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Unidades Educativas
                    {activeTab === 'units' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-full animate-in slide-in-from-left-2" />}
                </button>
            </div>

            {/* Content Manager */}
            <div className="grid grid-cols-1 gap-8">
                <Card className="p-0 border-none shadow-premium bg-white overflow-hidden min-h-[500px]">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900">
                            {activeTab === 'depts' ? 'Catálogo de Departamentos' : activeTab === 'districts' ? 'Lista de Distritos' : 'Gestión de Unidades Educativas'}
                        </h3>
                        <Button 
                            onClick={() => openEdit()}
                            className="rounded-2xl h-14 px-8 font-black bg-slate-900 text-white hover:bg-black gap-2 shadow-xl shadow-slate-200"
                        >
                            <span className="material-symbols-rounded">add_circle</span>
                            Nuevo {activeTab === 'depts' ? 'Dpto' : activeTab === 'districts' ? 'Distrito' : 'Unidad'}
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Sincronizando con el servidor...</p>
                        </div>
                    ) : (activeTab === 'depts' ? filteredDepts : activeTab === 'districts' ? filteredDistricts : filteredUnits).length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <span className="material-symbols-rounded text-6xl text-slate-100">inventory_2</span>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No se encontraron registros</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-50">
                                        <th className="p-6">Nombre</th>
                                        {activeTab === 'districts' && <th className="p-6">Departamento</th>}
                                        {activeTab === 'units' && (
                                            <>
                                                <th className="p-6">Distrito / Ubicación</th>
                                                <th className="p-6">Director Asignado</th>
                                            </>
                                        )}
                                        <th className="p-6 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(activeTab === 'depts' ? filteredDepts : activeTab === 'districts' ? filteredDistricts : filteredUnits).map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                        {item.id}
                                                    </div>
                                                    <span className="font-black text-slate-900">{item.nombre}</span>
                                                </div>
                                            </td>
                                            {activeTab === 'districts' && (
                                                <td className="p-6">
                                                    <Badge variant="outline" className="font-bold border-slate-200">
                                                        {item.departamento?.nombre || '—'}
                                                    </Badge>
                                                </td>
                                            )}
                                            {activeTab === 'units' && (
                                                <>
                                                    <td className="p-6">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-bold text-slate-700">{item.distrito?.nombre}</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.distrito?.departamento?.nombre}</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        {item.director ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                                                                    {item.director.nombres[0]}
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-700">{item.director.nombres} {item.director.apellidos}</span>
                                                            </div>
                                                        ) : (
                                                            <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Sin Director</Badge>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button 
                                                        onClick={() => openEdit(item)}
                                                        className="p-3 rounded-xl hover:bg-white hover:shadow-soft text-slate-400 hover:text-blue-600 transition-all"
                                                    >
                                                        <span className="material-symbols-rounded">edit_note</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => activeTab === 'depts' ? deleteDepartment(item.id) : activeTab === 'districts' ? deleteDistrict(item.id) : deleteUnit(item.id)}
                                                        className="p-3 rounded-xl hover:bg-white hover:shadow-soft text-slate-400 hover:text-rose-600 transition-all"
                                                    >
                                                        <span className="material-symbols-rounded">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Edit Modal */}
            {showModal && editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                                    {editingItem.id ? 'Editar' : 'Nueva'} {activeTab === 'depts' ? 'Departamento' : activeTab === 'districts' ? 'Distrito' : 'Unidad Educativa'}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configuración Estructural</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-10 rounded-full hover:bg-slate-200 text-slate-400 transition-all flex items-center justify-center">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="p-8 space-y-6">
                                {activeTab === 'units' && !editingItem.id && (
                                     <Input 
                                        label="Código SIE / ID"
                                        placeholder="Ej: 80620001"
                                        type="number"
                                        value={editingItem.id || ''}
                                        onChange={(e) => setEditingItem({...editingItem, id: parseInt(e.target.value)})}
                                        required
                                    />
                                )}

                                <Input 
                                    label="Nombre Oficial"
                                    placeholder={activeTab === 'depts' ? 'Ej: La Paz' : activeTab === 'districts' ? 'Ej: Distrito 1' : 'Ej: U.E. Simon Bolivar'}
                                    value={editingItem.nombre}
                                    onChange={(e) => setEditingItem({...editingItem, nombre: e.target.value})}
                                    required
                                />

                                {activeTab === 'districts' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Departamento</label>
                                        <select 
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-slate-900 appearance-none"
                                            value={editingItem.departamento_id}
                                            onChange={(e) => setEditingItem({...editingItem, departamento_id: parseInt(e.target.value)})}
                                            required
                                        >
                                            <option value="">Selecciona un departamento...</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'units' && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Distrito Educativo</label>
                                                <select 
                                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-slate-900 appearance-none"
                                                    value={editingItem.distrito_id}
                                                    onChange={(e) => setEditingItem({...editingItem, distrito_id: parseInt(e.target.value)})}
                                                    required
                                                >
                                                    <option value="">Selecciona distrito...</option>
                                                    {districts.map(d => (
                                                        <option key={d.id} value={d.id}>{d.nombre} ({d.departamento?.nombre})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Input 
                                                label="Teléfono / Celular"
                                                placeholder="Ej: 22446688"
                                                value={editingItem.telefono || ''}
                                                onChange={(e) => setEditingItem({...editingItem, telefono: e.target.value})}
                                            />
                                        </div>

                                        <Input 
                                            label="Dirección / Ubicación"
                                            placeholder="Calle, zona, nro..."
                                            value={editingItem.direccion || ''}
                                            onChange={(e) => setEditingItem({...editingItem, direccion: e.target.value})}
                                        />

                                        <div className="space-y-2 pt-4 border-t border-slate-50">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-1 flex items-center gap-2">
                                                <span className="material-symbols-rounded text-sm">shield_person</span>
                                                Asignación de Director
                                            </label>
                                            <select 
                                                className="w-full p-4 bg-indigo-50/30 border-2 border-indigo-100 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500 appearance-none"
                                                value={editingItem.director_id || ''}
                                                onChange={(e) => setEditingItem({...editingItem, director_id: e.target.value})}
                                            >
                                                <option value="">Sin Director (Vacante)</option>
                                                {directors.map(d => (
                                                    <option key={d.id} value={d.id}>{d.nombres} {d.apellidos} ({d.email})</option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-400 italic ml-1">Solo se muestran usuarios registrados con el rol "Director".</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)} className="px-8 font-black rounded-2xl">
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={saving} className="px-10 font-black rounded-2xl bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200">
                                    Sincronizar
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

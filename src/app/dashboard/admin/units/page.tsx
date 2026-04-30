'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';
import { Unit } from '@/services/admin.service';
import { PageHeader } from '@/components/ui/PageHeader';


export default function AdminUnitsPage() {
    const router = useRouter();
    const {
        units,
        districts,
        loading,
        saving,
        error: controllerError,
        checkAccess,
        loadUnitsData,
        saveUnit,
        deleteUnit
    } = useAdminController();

    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentUnit, setCurrentUnit] = useState<Partial<Unit>>({});
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                loadUnitsData();
            }
        };
        init();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await saveUnit(currentUnit, isEditing);
        if (success) {
            setShowModal(false);
            loadUnitsData();
        }
    };

    const handleDelete = async (id: number) => {
        const success = await deleteUnit(id);
        if (success) loadUnitsData();
    };

    const openNew = () => {
        setCurrentUnit({});
        setIsEditing(false);
        setShowModal(true);
    };

    const openEdit = (unit: Unit) => {
        setCurrentUnit(unit);
        setIsEditing(true);
        setShowModal(true);
    };

    const filteredUnits = units.filter(u =>
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id?.toString().includes(searchTerm)
    );

    if (loading && units.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium animate-pulse">Cargando unidades...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <PageHeader
                title={
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all hover:scale-110">
                            <span className="material-symbols-rounded text-slate-500 text-xl lg:text-2xl">arrow_back</span>
                        </button>
                        <span>Unidades Educativas</span>
                    </div>
                }
                subtitle="Gestiona el catálogo central de escuelas y sedes."
                actions={
                    <>
                        <div className="relative group/search hidden md:block">
                            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within/search:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-48 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-2xl shadow-lg shadow-blue-500/20 gap-2">
                            <span className="material-symbols-rounded">add_circle</span>
                            <span className="font-bold text-sm">Nueva Unidad</span>
                        </Button>
                    </>
                }
            />

            {controllerError && (
                <Card className="bg-danger/5 border-danger/20 p-4">
                    <div className="flex items-center gap-3 text-danger">
                        <span className="material-symbols-rounded">error</span>
                        <p className="font-bold text-sm">{controllerError}</p>
                    </div>
                </Card>
            )}

            <Card className="p-0 overflow-hidden border-border shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-border text-[10px] uppercase text-slate-400 font-black tracking-widest">
                                <th className="p-5">Nombre / Código SIE</th>
                                <th className="p-5">Ubicación</th>
                                <th className="p-5">Distrito / Depto</th>
                                <th className="p-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUnits.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-rounded text-4xl text-slate-200">folder_off</span>
                                            <p className="text-slate-400 font-medium">No se encontraron unidades educativas</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUnits.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{unit.nombre}</p>
                                                <Badge variant="default" className="w-fit">{unit.id}</Badge>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <span className="material-symbols-rounded text-slate-300 text-lg">location_on</span>
                                                <span className="line-clamp-1">{unit.direccion || 'Sin dirección registrada'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-bold text-slate-700">{unit.distrito?.nombre || '-'}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{unit.distrito?.departamento?.nombre || 'Nacional'}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openEdit(unit)}
                                                    className="p-2 hover:bg-primary/10 text-slate-400 hover:text-primary rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-rounded text-xl">edit_square</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(unit.id)}
                                                    className="p-2 hover:bg-danger/10 text-slate-400 hover:text-danger rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-symbols-rounded text-xl">delete_sweep</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal de Unidad */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg p-0 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">
                                    {isEditing ? 'Editar Unidad' : 'Nueva Unidad Educativa'}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Completa los datos oficiales de la institución.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-6">
                            <Input
                                label="Nombre oficial de la Unidad"
                                icon="apartment"
                                placeholder="Ej: Unidad Educativa Simón Bolívar"
                                value={currentUnit.nombre || ''}
                                onChange={e => setCurrentUnit({ ...currentUnit, nombre: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <Input
                                    label="Código SIE"
                                    icon="pin"
                                    type="number"
                                    placeholder="80710XXX"
                                    value={currentUnit.id || ''}
                                    onChange={e => setCurrentUnit({ ...currentUnit, id: parseInt(e.target.value) || undefined })}
                                    required={!isEditing}
                                    disabled={isEditing}
                                />
                                <Input
                                    label="Teléfono / Contacto"
                                    icon="call"
                                    placeholder="2-123456"
                                    value={currentUnit.telefono || ''}
                                    onChange={e => setCurrentUnit({ ...currentUnit, telefono: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Dirección / Ubicación"
                                icon="map"
                                placeholder="Zona Central, Calle X #Y"
                                value={currentUnit.direccion || ''}
                                onChange={e => setCurrentUnit({ ...currentUnit, direccion: e.target.value })}
                            />

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Distrito Educativo</label>
                                <div className="relative group/select">
                                    <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/select:text-primary transition-colors text-lg">location_city</span>
                                    <select
                                        className="w-full bg-slate-50 border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-foreground transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary appearance-none"
                                        value={currentUnit.distrito_id || ''}
                                        onChange={e => setCurrentUnit({ ...currentUnit, distrito_id: parseInt(e.target.value) })}
                                        required
                                    >
                                        <option value="">Selecciona un distrito...</option>
                                        {districts.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.nombre} ({d.departamento?.nombre || 'General'})
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-rounded absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowModal(false)}
                                    className="px-6"
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={saving} className="px-8 shadow-blue-500/20">
                                    {isEditing ? 'Guardar Cambios' : 'Registrar Unidad'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}


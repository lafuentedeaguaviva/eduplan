'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceResponse, AreaTrabajo } from '@/types';
export type { AreaTrabajo };
import { AreasService, Catalogs } from '@/services/areas.service';
import { CatalogService } from '@/services/catalog.service';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { Combobox } from '@/components/ui/Combobox';
import { AlertDialog } from '@/components/ui/AlertDialog';

// Simple Icons
const IconSchool = () => <span className="material-symbols-rounded">school</span>;
const IconAdd = () => <span className="material-symbols-rounded text-xl">add</span>;
const IconDelete = () => <span className="material-symbols-rounded text-red-500 hover:text-red-700">delete</span>;
const IconSchedule = () => <span className="material-symbols-rounded text-sm">schedule</span>;
const IconGroup = () => <span className="material-symbols-rounded text-sm">group</span>;

export default function WorkAreasPage() {
    const router = useRouter();
    const [areas, setAreas] = useState<AreaTrabajo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Delete Confirmation State
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Catalogs State
    const [unidades, setUnidades] = useState<{ id: number; nombre: string; }[]>([]);
    const [niveles, setNiveles] = useState<{ id: number; nombre: string; }[]>([]);
    const [grados, setGrados] = useState<{ id: number; nombre: string; }[]>([]);
    const [areasConocimiento, setAreasConocimiento] = useState<{ id: number; nombre: string; }[]>([]);
    const [turnos, setTurnos] = useState<{ id: string; nombre: string; }[]>([]);
    const [paralelos, setParalelos] = useState<{ id: string; nombre: string; }[]>([]);
    const [directores, setDirectores] = useState<any[]>([]);
    const [isLoadingDirectors, setIsLoadingDirectors] = useState(false);

    // Form State
    const [selectedNivel, setSelectedNivel] = useState<number | ''>('');
    const [selectedGrado, setSelectedGrado] = useState<number | ''>('');

    // Location State
    const [departamentos, setDepartamentos] = useState<{ id: number; nombre: string; }[]>([]);
    const [distritos, setDistritos] = useState<{ id: number; nombre: string; }[]>([]);
    const [selectedDepto, setSelectedDepto] = useState<number | ''>('');
    const [selectedDistrito, setSelectedDistrito] = useState<number | ''>('');

    const [formData, setFormData] = useState({
        unidad_educativa_id: '' as number | '',
        area_conocimiento_id: '' as number | '',
        turno_id: '',
        paralelos_ids: [] as string[],
        director_id: '',
        horarios: {} as Record<string, any>
    });

    // Initial Load
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load Grades when Nivel changes
    useEffect(() => {
        if (selectedNivel) {
            CatalogService.getGrados(selectedNivel).then(res => setGrados(res.data || []));
        } else {
            setGrados([]);
            setSelectedGrado('');
            setAreasConocimiento([]);
        }
    }, [selectedNivel]);

    // Load Areas when Grade changes
    useEffect(() => {
        if (selectedGrado) {
            CatalogService.getAreasByGrado(selectedGrado).then(res => setAreasConocimiento(res.data || []));
        } else {
            setAreasConocimiento([]);
            setFormData(prev => ({ ...prev, area_conocimiento_id: '' }));
        }
    }, [selectedGrado]);

    // Load Districts when Depto changes
    useEffect(() => {
        if (selectedDepto) {
            CatalogService.getDistritos(selectedDepto).then(res => setDistritos(res.data || []));
        } else {
            setDistritos([]);
            setSelectedDistrito('');
            setUnidades([]);
        }
    }, [selectedDepto]);

    // Load Units when Distrito changes
    useEffect(() => {
        if (selectedDistrito) {
            CatalogService.getUnidades(selectedDistrito).then(res => setUnidades(res.data || []));
        } else {
            setUnidades([]);
            setFormData(prev => ({ ...prev, unidad_educativa_id: '' }));
        }
    }, [selectedDistrito]);

    // Load Directors when Unit changes
    useEffect(() => {
        if (formData.unidad_educativa_id) {
            setIsLoadingDirectors(true);
            AreasService.getDirectorsByUnit(formData.unidad_educativa_id as number)
                .then(res => {
                    setDirectores(res.data || []);
                    // Si solo hay uno, seleccionarlo automáticamente si no estamos editando o si el valor está vacío
                    if (res.data && res.data.length === 1 && !formData.director_id) {
                        setFormData(prev => ({ ...prev, director_id: res.data![0].id }));
                    }
                })
                .finally(() => setIsLoadingDirectors(false));
        } else {
            setDirectores([]);
            setFormData(prev => ({ ...prev, director_id: '' }));
        }
    }, [formData.unidad_educativa_id]);

    const loadInitialData = async () => {
        try {
            const { data: sessionData } = await AuthService.getSession();
            const session = sessionData.session;
            if (session?.user) {
                const [resAreas, deptosData, n, t, p] = await Promise.all([
                    AreasService.getAreas(session.user.id),
                    CatalogService.getDepartamentos(),
                    CatalogService.getNiveles(),
                    CatalogService.getTurnos(),
                    CatalogService.getParalelos()
                ]);

                if (resAreas.success && resAreas.data) {
                    setAreas(resAreas.data);
                }
                setDepartamentos(deptosData.data || []);
                setNiveles(n.data || []);
                setTurnos(t.data || []);
                setParalelos(p.data || []);
                // Units are loaded dynamically now

            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { data: { session } } = await AuthService.getSession();
            if (!session?.user) return;

            if (!editingAreaId) {
                const isDuplicate = areas.find(a =>
                    a.unidad_educativa.id === formData.unidad_educativa_id &&
                    a.area_conocimiento.id === formData.area_conocimiento_id &&
                    a.turno.id === formData.turno_id
                );

                if (isDuplicate) {
                    alert('Ya existe esta área de trabajo vinculada a tu cuenta con los mismos datos (Unidad Educativa, Área y Turno).');
                    setIsSaving(false);
                    return;
                }
            }

            let result;
            if (editingAreaId) {
                result = await AreasService.updateArea(editingAreaId, {
                    unidad_educativa_id: formData.unidad_educativa_id as number,
                    area_conocimiento_id: formData.area_conocimiento_id as number,
                    turno_id: formData.turno_id,
                    paralelos_ids: formData.paralelos_ids,
                    director_id: formData.director_id,
                    horarios: formData.horarios
                });
            } else {
                result = await AreasService.createArea({
                    profesor_id: session.user.id,
                    unidad_educativa_id: formData.unidad_educativa_id as number,
                    area_conocimiento_id: formData.area_conocimiento_id as number,
                    turno_id: formData.turno_id,
                    paralelos_ids: formData.paralelos_ids,
                    director_id: formData.director_id,
                    horarios: formData.horarios
                });
            }

            console.log('AreasService result:', result);

            if (result && result.success) {
                setShowModal(false);
                resetForm();
                loadInitialData(); // Reload areas
            } else {
                const errorObj = result?.error;
                let errorDetail = 'Error desconocido';

                if (errorObj?.code === '23505') {
                    errorDetail = 'Ya existe esta área de trabajo con el mismo nivel, grado, área y turno.';
                } else {
                    errorDetail = errorObj?.message || (typeof errorObj === 'string' ? errorObj : JSON.stringify(errorObj)) || 'Error desconocido';
                }

                alert(`Error al ${editingAreaId ? 'actualizar' : 'crear'} área de trabajo: ${errorDetail}`);
                console.error('Full area service error:', errorObj);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            unidad_educativa_id: '',
            area_conocimiento_id: '',
            turno_id: '',
            paralelos_ids: [],
            director_id: '',
            horarios: {}
        });
        setSelectedNivel('');
        setSelectedGrado('');
        setSelectedDepto('');
        setSelectedDistrito('');
        setEditingAreaId(null);
    };

    const handleEdit = async (area: AreaTrabajo) => {
        setIsLoading(true);
        try {
            // Fetch full details to get depto/distrito IDs
            const resArea = await AreasService.getAreaById(area.id);
            const fullArea = resArea.data;
            if (!fullArea) return;

            // Load dependent catalogs in parallel BEFORE setting values to avoid race conditions
            const ue = fullArea.unidad_educativa as any;
            const dist = ue.distrito;
            const depto = dist.departamento;
            const ac = fullArea.area_conocimiento as any;
            const grado = ac.grado;
            const nivel = grado.nivel;

            const [distritosData, unidadesData, gradosData, areasData] = await Promise.all([
                CatalogService.getDistritos(depto.id),
                CatalogService.getUnidades(dist.id),
                CatalogService.getGrados(nivel.id),
                CatalogService.getAreasByGrado(grado.id)
            ]);

            // Set catalogs first
            setDistritos(distritosData.data || []);
            setUnidades(unidadesData.data || []);
            setGrados(gradosData.data || []);
            setAreasConocimiento(areasData.data || []);

            // Set IDs
            setEditingAreaId(fullArea.id);
            setSelectedDepto(depto.id);
            setSelectedDistrito(dist.id);
            setSelectedNivel(nivel.id);
            setSelectedGrado(grado.id);

            setFormData({
                unidad_educativa_id: fullArea.unidad_educativa.id,
                area_conocimiento_id: fullArea.area_conocimiento.id,
                turno_id: fullArea.turno.id,
                paralelos_ids: fullArea.paralelos.map(p => p.id),
                director_id: fullArea.director_id || '',
                horarios: fullArea.paralelos.reduce((acc: any, p: any) => ({...acc, [p.id]: p.horario || {}}), {})
            });

            setShowModal(true);
        } catch (error) {
            console.error('Error loading area for edit:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setAreaToDelete(id);
        setShowDeleteAlert(true);
    };

    const confirmDelete = async () => {
        if (!areaToDelete) return;
        setIsDeleting(true);
        try {
            const res = await AreasService.deleteArea(areaToDelete);
            if (res.success) {
                setAreas(areas.filter(a => a.id !== areaToDelete));
                setShowDeleteAlert(false);
            } else {
                alert('Error al eliminar: ' + (res.error?.message || 'Error desconocido'));
            }
        } finally {
            setIsDeleting(false);
            setAreaToDelete(null);
        }
    };

    const toggleParalelo = (id: string) => {
        setFormData(prev => {
            const exists = prev.paralelos_ids.includes(id);
            if (exists) {
                const newHorarios = { ...prev.horarios };
                delete newHorarios[id];
                return { ...prev, paralelos_ids: prev.paralelos_ids.filter(p => p !== id), horarios: newHorarios };
            } else {
                return { ...prev, paralelos_ids: [...prev.paralelos_ids, id], horarios: { ...prev.horarios, [id]: {} } };
            }
        });
    };

    const addBlock = (pid: string) => {
        const daySelect = document.getElementById(`day-${pid}`) as HTMLSelectElement;
        const startInput = document.getElementById(`start-${pid}`) as HTMLInputElement;
        const endInput = document.getElementById(`end-${pid}`) as HTMLInputElement;
        if (!startInput.value || !endInput.value) {
            alert("Debe ingresar hora de inicio y fin");
            return;
        }
        if (startInput.value >= endInput.value) {
            alert("La hora de fin debe ser mayor a la de inicio");
            return;
        }
        
        const day = daySelect.value;
        const inicioVal = startInput.value;
        const finVal = endInput.value;
        
        setFormData(prev => {
            const currentSchedule = prev.horarios[pid] || {};
            const dayBlocks = currentSchedule[day] || [];
            return {
                ...prev,
                horarios: {
                    ...prev.horarios,
                    [pid]: {
                        ...currentSchedule,
                        [day]: [...dayBlocks, { inicio: inicioVal, fin: finVal }].sort((a, b) => a.inicio.localeCompare(b.inicio))
                    }
                }
            };
        });
        startInput.value = '';
        endInput.value = '';
    };

    const removeBlock = (pid: string, day: string, index: number) => {
        setFormData(prev => {
            const currentSchedule = prev.horarios[pid] || {};
            const dayBlocks = [...(currentSchedule[day] || [])];
            dayBlocks.splice(index, 1);
            
            const newSchedule = { ...currentSchedule, [day]: dayBlocks };
            if (dayBlocks.length === 0) delete newSchedule[day];

            return {
                ...prev,
                horarios: {
                    ...prev.horarios,
                    [pid]: newSchedule
                }
            };
        });
    };

    if (isLoading) return <div className="p-8"><div className="animate-pulse h-8 w-48 bg-slate-200 rounded mb-4"></div></div>;

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <PageHeader
                title="Áreas de Trabajo"
                subtitle="Gestiona tus clases, materias y paralelos asignados."
                icon="school"
                actions={
                    <Button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-2xl shadow-lg shadow-blue-500/20 gap-2"
                    >
                        <IconAdd />
                        <span className="font-bold">Nueva Clase</span>
                    </Button>
                }
            />

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <IconSchool />
                        <p className="mt-2">No tienes áreas de trabajo asignadas.</p>
                        <Button variant="ghost" onClick={() => setShowModal(true)}>Crear la primera</Button>
                    </div>
                )}

                {areas.map(area => (
                    <div
                        key={area.id}
                        onClick={() => handleEdit(area)}
                        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all p-5 group relative cursor-pointer"
                    >
                        <div className="absolute top-4 right-4 flex gap-1 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(area.id);
                                }}
                                className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full text-red-500"
                            >
                                <IconDelete />
                            </button>
                        </div>

                        <div className="mb-4">
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
                                {area.unidad_educativa?.nombre}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {area.area_conocimiento?.nombre}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                            {(area.area_conocimiento as any).grado?.nombre} • {(area.area_conocimiento as any).grado?.nivel?.nombre}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1.5">
                                <IconSchedule />
                                <span>{area.turno?.nombre}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <IconGroup />
                                <div className="flex gap-1">
                                    {area.paralelos?.map(p => (
                                        <span key={p.id} className="font-bold bg-slate-100 px-1.5 rounded text-slate-800">
                                            {p.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header Fijo */}
                        <div className="p-6 pb-4 border-b border-slate-100">
                            <h2 className="text-xl font-bold text-slate-900">{editingAreaId ? 'Editar Clase' : 'Nueva Clase'}</h2>
                        </div>

                        {/* Contenido Desplazable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            <div className="space-y-4">
                                {/* Selección Jerárquica: Departamento -> Distrito -> Unidad */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={selectedDepto}
                                            onChange={e => setSelectedDepto(e.target.value ? Number(e.target.value) : '')}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {departamentos.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Distrito</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={selectedDistrito}
                                            onChange={e => setSelectedDistrito(e.target.value ? Number(e.target.value) : '')}
                                            disabled={!selectedDepto}
                                        >
                                            <option value="">{selectedDepto ? 'Seleccionar...' : 'Elige Depto'}</option>
                                            {distritos.map(d => (
                                                <option key={d.id} value={d.id}>{d.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <Combobox
                                        label="Unidad Educativa"
                                        options={unidades}
                                        value={formData.unidad_educativa_id}
                                        onChange={val => setFormData({ ...formData, unidad_educativa_id: val as number | '' })}
                                        disabled={!selectedDistrito}
                                        placeholder={selectedDistrito ? 'Buscar unidad educativa...' : 'Elige un Distrito primero'}
                                    />
                                </div>

                                {/* Selección de Director */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Director/a de Referencia</label>
                                    <select
                                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                        value={formData.director_id}
                                        onChange={e => setFormData({ ...formData, director_id: e.target.value })}
                                        disabled={!formData.unidad_educativa_id || isLoadingDirectors}
                                    >
                                        <option value="">
                                            {isLoadingDirectors ? 'Cargando directores...' : 
                                             !formData.unidad_educativa_id ? 'Elige una Unidad primero' : 
                                             directores.length === 0 ? 'No hay directores registrados' : 'Seleccionar director...'}
                                        </option>
                                        {directores.map((d, index) => (
                                            <option key={`${d.id || 'dir'}-${index}`} value={d.id || ''}>
                                                {d.nombres} {d.apellidos} ({d.nivel})
                                            </option>
                                        ))}
                                    </select>
                                    {directores.length === 0 && formData.unidad_educativa_id && !isLoadingDirectors && (
                                        <p className="mt-1 text-xs text-amber-600 font-medium flex items-center gap-1">
                                            <span className="material-symbols-rounded text-sm">warning</span>
                                            Esta unidad no tiene directores vinculados en Gestión de Directores.
                                        </p>
                                    )}
                                </div>

                                {/* Nivel y Grado */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={selectedNivel}
                                            onChange={e => setSelectedNivel(e.target.value ? Number(e.target.value) : '')}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {niveles.map(n => (
                                                <option key={n.id} value={n.id}>{n.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Grado</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={selectedGrado}
                                            onChange={e => setSelectedGrado(e.target.value ? Number(e.target.value) : '')}
                                            disabled={!selectedNivel}
                                        >
                                            <option value="">{selectedNivel ? 'Seleccionar...' : 'Elige un Nivel primero'}</option>
                                            {grados.map(g => (
                                                <option key={g.id} value={g.id}>{g.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Área */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Área de Conocimiento</label>
                                    <select
                                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.area_conocimiento_id}
                                        onChange={e => setFormData({ ...formData, area_conocimiento_id: e.target.value ? Number(e.target.value) : '' })}
                                        disabled={!selectedGrado}
                                    >
                                        <option value="">{selectedGrado ? 'Seleccionar...' : 'Elige un Grado primero'}</option>
                                        {areasConocimiento.map(a => (
                                            <option key={a.id} value={a.id}>{a.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Turno */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Turno</label>
                                    <select
                                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.turno_id}
                                        onChange={e => setFormData({ ...formData, turno_id: e.target.value })}
                                    >
                                        <option value="">Seleccionar...</option>
                                        {turnos.map(t => (
                                            <option key={t.id} value={t.id}>{t.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Paralelos */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Paralelos y Horarios</label>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {paralelos.map((p: any) => {
                                            const isSelected = formData.paralelos_ids.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    onClick={() => toggleParalelo(p.id)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${isSelected
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                                                        }`}
                                                >
                                                    {p.nombre}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {/* Configurador de Horarios por Paralelo Seleccionado */}
                                    {formData.paralelos_ids.length > 0 && (
                                        <div className="space-y-4">
                                            {formData.paralelos_ids.map(pid => {
                                                const paraleloInfo = paralelos.find(p => p.id === pid);
                                                const schedule = formData.horarios[pid] || {};
                                                const hasBlocks = Object.keys(schedule).length > 0;
                                                
                                                return (
                                                    <div key={pid} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                                            <IconSchedule /> Horario - Paralelo {paraleloInfo?.nombre}
                                                        </h4>
                                                        
                                                        {hasBlocks && (
                                                            <div className="flex flex-col gap-2 mb-4">
                                                                {Object.entries(schedule).flatMap(([dia, bloques]) => 
                                                                    (bloques as any[]).map((b, idx) => (
                                                                        <div key={`${dia}-${idx}`} className="flex justify-between items-center bg-white p-2.5 border border-slate-200 rounded-lg text-sm shadow-sm">
                                                                            <span className="capitalize font-bold text-blue-600 w-24">{dia}</span>
                                                                            <span className="text-slate-600 font-medium bg-slate-100 px-2 py-1 rounded-md">{b.inicio} - {b.fin}</span>
                                                                            <button onClick={() => removeBlock(pid, dia, idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                                                                <IconDelete />
                                                                            </button>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                                                            <select id={`day-${pid}`} className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium outline-none focus:border-blue-500 w-full sm:w-auto" defaultValue="lunes">
                                                                {['lunes', 'martes', 'miercoles', 'jueves', 'viernes'].map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
                                                            </select>
                                                            <input type="time" id={`start-${pid}`} className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium outline-none focus:border-blue-500 w-full sm:w-auto" />
                                                            <span className="text-slate-400 font-medium hidden sm:block">a</span>
                                                            <input type="time" id={`end-${pid}`} className="p-2.5 border border-slate-200 rounded-lg text-sm bg-white font-medium outline-none focus:border-blue-500 w-full sm:w-auto" />
                                                            <Button variant="outline" size="sm" onClick={() => addBlock(pid)} className="w-full sm:w-auto shrink-0 bg-white border-dashed border-2 hover:bg-slate-50 gap-2 font-bold h-10">
                                                                <IconAdd /> Añadir
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Fijo */}
                        <div className="p-6 pt-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <Button variant="ghost" onClick={() => setShowModal(false)} className="w-auto px-6 py-2.5 shadow-none">
                                Cancelar
                            </Button>
                            <Button
                                className="w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                                onClick={handleSave}
                                isLoading={isSaving}
                                disabled={!formData.unidad_educativa_id || !formData.area_conocimiento_id || !formData.turno_id || formData.paralelos_ids.length === 0}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Alerta de Eliminación */}
            <AlertDialog
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="¿Eliminar área de trabajo?"
                description="¡Atención! Esta acción es irreversible. Al borrar esta área se eliminarán PERMANENTEMENTE todos los contenidos personalizados, planificaciones semanales, diseños curriculares y registros de IA asociados. ¿Deseas continuar?"
                confirmText="Sí, eliminar todo en cascada"
                cancelText="Cancelar"
            />
        </div>
    );
}


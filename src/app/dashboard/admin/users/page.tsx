'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';
import { toast } from 'sonner';

interface User {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    celular?: string;
    creditos: number;
    roles: string[];
    estado_completitud: boolean;
    created_at: string;
    unidades_ids: number[];
    distritos_ids: number[];
    departamentos_ids: number[];
    areas_ids: number[];
    unidades_nombres: string;
    areas_nombres: string;
    director_unidad_id?: number | null;
    director_nivel?: string;
}

interface Role {
    nombre: string;
    descripcion: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const {
        users,
        roles: allRoles,
        departments,
        districts,
        units,
        areas: allKnowledgeAreas,
        loading,
        saving,
        error: controllerError,
        checkAccess,
        loadUsersData,
        loadCurriculumData,
        loadUnitsData,
        loadGeoData,
        saveUserRoles,
        saveRole,
        deleteRole,
        createProfile
    } = useAdminController();

    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');
    const [filterDistrict, setFilterDistrict] = useState<string>('all');
    const [filterUnit, setFilterUnit] = useState<string>('all');
    const [filterArea, setFilterArea] = useState<string>('all');
    
    // UI State para el buscador interno de unidades
    const [unitSearchTerm, setUnitSearchTerm] = useState('');
    
    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    
    // User Management State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitLevel, setSelectedUnitLevel] = useState<string>('General');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', nombres: '', apellidos: '', roles: ['Profesor'] as string[] });

    // Role Management State
    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
    const [newRole, setNewRole] = useState({ nombre: '', descripcion: '' });

    // Modal Triad State (for Director Assignment)
    const [modalDept, setModalDept] = useState<string>('all');
    const [modalDistrict, setModalDistrict] = useState<string>('all');
    const [modalUnitSearch, setModalUnitSearch] = useState('');

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                loadUsersData();
                loadCurriculumData();
                loadUnitsData();
                loadGeoData();
            }
        };
        init();
    }, []);

    // --- CASCADING & SEARCH LOGIC ---

    // Filter districts based on selected department
    const filteredDistrictsDropdown = useMemo(() => {
        if (filterDepartment === 'all') return districts;
        return districts.filter(d => d.departamento_id === parseInt(filterDepartment));
    }, [districts, filterDepartment]);

    // Filter and search units based on selected district AND unitSearchTerm
    const filteredUnitsDropdown = useMemo(() => {
        let list = units;
        
        // Filter by hierarchy first
        if (filterDistrict !== 'all') {
            list = list.filter(u => u.distrito_id === parseInt(filterDistrict));
        } else if (filterDepartment !== 'all') {
            const deptDistrictsIds = districts
                .filter(d => d.departamento_id === parseInt(filterDepartment))
                .map(d => d.id);
            list = list.filter(u => deptDistrictsIds.includes(u.distrito_id));
        }

        // Apply internal unit search (BUSCADOR INTERNO)
        if (unitSearchTerm.trim()) {
            const search = unitSearchTerm.toLowerCase();
            list = list.filter(u => u.nombre.toLowerCase().includes(search));
        }

        return list;
    }, [units, districts, filterDistrict, filterDepartment, unitSearchTerm]);

    // Reset filters on hierarchy change
    useEffect(() => {
        if (filterDepartment !== 'all') {
            const districtExists = filteredDistrictsDropdown.some(d => d.id === parseInt(filterDistrict));
            if (filterDistrict !== 'all' && !districtExists) {
                setFilterDistrict('all');
                setFilterUnit('all');
            }
        }
    }, [filterDepartment, filteredDistrictsDropdown]);

    useEffect(() => {
        if (filterDistrict !== 'all' && filterUnit !== 'all') {
            const unitExists = filteredUnitsDropdown.some(u => u.id === parseInt(filterUnit));
            if (!unitExists) setFilterUnit('all');
        }
    }, [filterDistrict, filteredUnitsDropdown]);

    // Triad logic for Modal (Director Assignment)
    const modalDistrictsDropdown = useMemo(() => {
        if (modalDept === 'all') return districts;
        return districts.filter(d => d.departamento_id === parseInt(modalDept));
    }, [districts, modalDept]);

    const modalUnitsDropdown = useMemo(() => {
        let list = units;
        if (modalDistrict !== 'all') {
            list = list.filter(u => u.distrito_id === parseInt(modalDistrict));
        } else if (modalDept !== 'all') {
            const deptDistrictsIds = districts
                .filter(d => d.departamento_id === parseInt(modalDept))
                .map(d => d.id);
            list = list.filter(u => deptDistrictsIds.includes(u.distrito_id));
        }
        if (modalUnitSearch.trim()) {
            const search = modalUnitSearch.toLowerCase();
            list = list.filter(u => u.nombre.toLowerCase().includes(search));
        }
        return list;
    }, [units, districts, modalDistrict, modalDept, modalUnitSearch]);

    const openEditRoles = (user: User) => {
        setCurrentUser(user);
        setSelectedRoles([...(user.roles || [])]);
        setSelectedUnitId(user.director_unidad_id || null);
        setSelectedUnitLevel(user.director_nivel || 'General');
        
        // Reset modal triad
        setModalDept('all');
        setModalDistrict('all');
        setModalUnitSearch('');
        
        setShowAssignModal(true);
    };

    const toggleRole = (roleName: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSaveRoles = async () => {
        if (!currentUser) return;
        const success = await saveUserRoles(currentUser.id, selectedRoles, selectedUnitId, selectedUnitLevel);
        if (success) {
            setShowAssignModal(false);
            loadUsersData();
        }
    };

    const handleCreateUser = async () => {
        const { success, error } = await createProfile(
            newUser.email, 
            newUser.password, 
            newUser.nombres, 
            newUser.apellidos,
            newUser.roles
        );
        if (success) {
            toast.success('Perfil creado con éxito');
            setShowCreateUserModal(false);
            setNewUser({ email: '', password: '', nombres: '', apellidos: '', roles: ['Profesor'] });
            loadUsersData();
        } else {
            toast.error(error || 'Error al crear el perfil. Verifique los datos.');
        }
    };

    const handleCreateRole = async () => {
        const success = await saveRole(newRole);
        if (success) {
            setShowCreateRoleModal(false);
            setNewRole({ nombre: '', descripcion: '' });
            loadUsersData();
        }
    };

    const handleDeleteRole = async (nombre: string) => {
        const success = await deleteRole(nombre);
        if (success) {
            loadUsersData();
        }
    };

    // Advanced Filtering Logic for Users Table
    const filteredUsers = (users as User[]).filter(u => {
        const matchesSearch = 
            (u.nombres?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (u.apellidos?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'all' || u.roles?.includes(filterRole);
        const matchesStatus = filterStatus === 'all' || (filterStatus === 'complete' ? u.estado_completitud : !u.estado_completitud);
        
        const matchesDept = filterDepartment === 'all' || u.departamentos_ids?.includes(parseInt(filterDepartment));
        const matchesDistrict = filterDistrict === 'all' || u.distritos_ids?.includes(parseInt(filterDistrict));
        const matchesUnit = filterUnit === 'all' || u.unidades_ids?.includes(parseInt(filterUnit));
        const matchesArea = filterArea === 'all' || u.areas_ids?.includes(parseInt(filterArea));

        return matchesSearch && matchesRole && matchesStatus && matchesDept && matchesDistrict && matchesUnit && matchesArea;
    });

    // Selection Handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredUsers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredUsers.map(u => u.id));
        }
    };

    // CSV Export Logic
    const exportToCSV = () => {
        const dataToExport = selectedIds.length > 0 
            ? filteredUsers.filter(u => selectedIds.includes(u.id))
            : filteredUsers;

        const headers = ['ID', 'Nombres', 'Apellidos', 'Email', 'Celular', 'Creditos', 'Roles', 'Estado', 'Unidades', 'Areas', 'Fecha Registro'];
        const csvRows = [
            headers.join(','),
            ...dataToExport.map(u => [
                u.id,
                `"${u.nombres}"`,
                `"${u.apellidos}"`,
                u.email,
                u.celular || '',
                u.creditos,
                `"${u.roles?.join('|') || ''}"`,
                u.estado_completitud ? 'Completo' : 'Incompleto',
                `"${u.unidades_nombres || ''}"`,
                `"${u.areas_nombres || ''}"`,
                new Date(u.created_at).toLocaleDateString()
            ].join(','))
        ];

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `usuarios_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium animate-pulse">Optimizando buscador de unidades...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all hover:scale-110">
                            <span className="material-symbols-rounded text-slate-500">arrow_back</span>
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Directorio Administrativo</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-12">Filtros dinámicos con búsqueda interna de instituciones.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={exportToCSV}
                        icon={<span className="material-symbols-rounded">download</span>}
                        className="bg-white"
                    >
                        Exportar CSV {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
                    </Button>
                    <Button onClick={() => setShowCreateUserModal(true)} variant="accent" icon={<span className="material-symbols-rounded">person_add</span>}>
                        Nuevo Perfil
                    </Button>
                </div>
            </div>

            {/* Selection Toolbar */}
            {selectedIds.length > 0 && (
                <div className="sticky top-4 z-40 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-8 duration-500 border border-white/10 mx-2">
                    <div className="flex items-center gap-4 px-2">
                        <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/30">
                            {selectedIds.length}
                        </div>
                        <div>
                            <p className="font-bold text-sm">Usuarios seleccionados</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Ejecución en bloque disponible</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="text-white hover:bg-white/10">
                            Cancelar
                        </Button>
                        <div className="h-6 w-px bg-white/10 mx-2" />
                        <Button size="sm" variant="accent" className="gap-2">
                            <span className="material-symbols-rounded text-base">generating_tokens</span>
                            Añadir Créditos
                        </Button>
                        <Button size="sm" variant="danger" className="gap-2">
                            <span className="material-symbols-rounded text-base">block</span>
                            Suspender
                        </Button>
                    </div>
                </div>
            )}

            {/* Tabs & Advanced Filters */}
            <div className="space-y-6">
                <div className="flex gap-8 border-b border-border">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'users' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Usuarios ({users.length})
                        {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in fade-in duration-300" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'roles' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Roles
                        {activeTab === 'roles' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full animate-in fade-in duration-300" />}
                    </button>
                </div>

                {activeTab === 'users' && (
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search Usuarios */}
                            <div className="relative group/search lg:col-span-1">
                                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within/search:text-primary transition-colors">person_search</span>
                                <input
                                    type="text"
                                    placeholder="Nombre o email..."
                                    className="pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            {/* Filter Department */}
                            <div className="relative">
                                <select 
                                    className="pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full outline-none appearance-none font-bold text-slate-700"
                                    value={filterDepartment}
                                    onChange={(e) => setFilterDepartment(e.target.value)}
                                >
                                    <option value="all">Todos los Departamentos</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">map</span>
                            </div>

                            {/* Filter District */}
                            <div className="relative">
                                <select 
                                    className="pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full outline-none appearance-none font-bold text-slate-700"
                                    value={filterDistrict}
                                    onChange={(e) => setFilterDistrict(e.target.value)}
                                >
                                    <option value="all">
                                        {filterDepartment === 'all' ? 'Todos los Distritos' : 'Distritos del Depto.'}
                                    </option>
                                    {filteredDistrictsDropdown.map(d => (
                                        <option key={d.id} value={d.id}>{d.nombre}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">location_city</span>
                            </div>

                            {/* Unidad Educativa con BUSCADOR INTERNO */}
                            <div className="space-y-2 col-span-1 md:col-span-1 lg:col-span-1">
                                <div className="relative group/unit-search">
                                    <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within/unit-search:text-primary transition-colors">apartment</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar Unidad..."
                                        className="pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full outline-none font-bold text-slate-700"
                                        value={unitSearchTerm}
                                        onChange={(e) => setUnitSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-xs focus:ring-2 focus:ring-primary/20 transition-all w-full outline-none font-medium text-slate-600 appearance-none"
                                    value={filterUnit}
                                    onChange={(e) => setFilterUnit(e.target.value)}
                                >
                                    <option value="all">
                                        {unitSearchTerm ? `Resultados (${filteredUnitsDropdown.length})` : 'Seleccionar de la lista...'}
                                    </option>
                                    {filteredUnitsDropdown.map(u => (
                                        <option key={u.id} value={u.id}>{u.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Filter */}
                            <div className="relative">
                                <select 
                                    className="pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full outline-none appearance-none font-medium"
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                >
                                    <option value="all">Cualquier Rol</option>
                                    {(allRoles as Role[]).map(r => (
                                        <option key={r.nombre} value={r.nombre}>{r.nombre}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">shield_person</span>
                            </div>

                            {/* Area Filter */}
                            <div className="relative">
                                <select 
                                    className="pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full outline-none appearance-none font-medium"
                                    value={filterArea}
                                    onChange={(e) => setFilterArea(e.target.value)}
                                >
                                    <option value="all">Todas las Áreas</option>
                                    {allKnowledgeAreas.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">book</span>
                            </div>

                            {/* Status Filter */}
                            <div className="relative">
                                <select 
                                    className="pl-4 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full outline-none appearance-none font-medium"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">Estado de Perfil</option>
                                    <option value="complete">Completo</option>
                                    <option value="incomplete">Incompleto</option>
                                </select>
                                <span className="material-symbols-rounded absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">verified</span>
                            </div>

                            <Button 
                                variant="ghost" 
                                className="text-slate-400 hover:text-primary gap-2"
                                onClick={() => {
                                    setSearchTerm(''); setFilterRole('all'); setFilterStatus('all'); 
                                    setFilterDepartment('all'); setFilterDistrict('all'); setFilterUnit('all'); setFilterArea('all');
                                    setUnitSearchTerm('');
                                }}
                            >
                                <span className="material-symbols-rounded text-base">filter_list_off</span>
                                Limpiar Filtros
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {controllerError && (
                <Card className="bg-danger/5 border-danger/20 p-4 animate-in shake-1 duration-500">
                    <div className="flex items-center gap-3 text-danger">
                        <span className="material-symbols-rounded">error</span>
                        <p className="font-bold text-sm">{controllerError}</p>
                    </div>
                </Card>
            )}

            {/* Content Table */}
            {activeTab === 'users' ? (
                <Card className="p-0 overflow-hidden border-border shadow-soft">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-border text-[10px] uppercase text-slate-400 font-black tracking-widest">
                                    <th className="p-5 w-12">
                                        <input 
                                            type="checkbox" 
                                            className="size-5 rounded-lg border-2 border-slate-200 accent-primary cursor-pointer transition-all hover:border-primary/50"
                                            checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="p-5">Usuario / Institución</th>
                                    <th className="p-5">Ubicación y Área</th>
                                    <th className="p-5">IA Créditos</th>
                                    <th className="p-5">Roles</th>
                                    <th className="p-5">Perfil</th>
                                    <th className="p-5 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-2">
                                                    <span className="material-symbols-rounded text-5xl">person_search</span>
                                                </div>
                                                <p className="text-slate-900 font-black text-lg">Sin coincidencias</p>
                                                <p className="text-slate-400 text-sm max-w-xs mx-auto">No hay usuarios que cumplan con la combinación de filtros seleccionada.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className={`hover:bg-slate-50/50 transition-all group ${selectedIds.includes(user.id) ? 'bg-primary/5' : ''}`}>
                                            <td className="p-5">
                                                <input 
                                                    type="checkbox" 
                                                    className="size-5 rounded-lg border-2 border-slate-200 accent-primary cursor-pointer transition-all hover:border-primary/50"
                                                    checked={selectedIds.includes(user.id)}
                                                    onChange={() => toggleSelect(user.id)}
                                                />
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary font-black text-sm shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                        {user.nombres?.[0]}{user.apellidos?.[0]}
                                                    </div>
                                                    <div className="max-w-[200px]">
                                                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{user.nombres} {user.apellidos}</p>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter line-clamp-1">{user.unidades_nombres || 'Sin unidad asignada'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-rounded text-xs text-slate-300">book</span>
                                                        <span className="text-xs font-bold text-slate-600 line-clamp-1">{user.areas_nombres || 'Área no definida'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <span className="material-symbols-rounded text-[12px]">location_on</span>
                                                        {user.celular || 'Sin Teléfono'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span className="font-black text-emerald-700 text-sm">{user.creditos}</span>
                                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">cr</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div 
                                                    className="flex flex-wrap gap-1 cursor-pointer hover:scale-105 transition-transform group/roles" 
                                                    onClick={() => openEditRoles(user)}
                                                    title="Click para editar roles"
                                                >
                                                    {user.roles && user.roles.length > 0 ? (
                                                        user.roles.map(role => (
                                                            <Badge key={role} variant={role === 'Administrador' ? 'accent' : 'default'} className="text-[8px] px-1.5 py-0.5 uppercase tracking-tighter shadow-sm">
                                                                {role}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-[9px] text-slate-300 italic">Sin roles</span>
                                                    )}
                                                    <span className="material-symbols-rounded text-[10px] text-slate-300 opacity-0 group-hover/roles:opacity-100 ml-1">edit</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {user.estado_completitud ? (
                                                    <Badge variant="success" className="gap-1 px-2 py-0.5 text-[9px]">
                                                        <span className="material-symbols-rounded text-[10px]">verified</span>
                                                        OK
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="warning" className="gap-1 px-2 py-0.5 text-[9px]">
                                                        <span className="material-symbols-rounded text-[10px]">priority_high</span>
                                                        PEND
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEditRoles(user)}
                                                    className="transition-all shadow-sm border-slate-200 hover:border-primary/30 hover:bg-primary/5 h-9"
                                                    title="Configurar Roles"
                                                >
                                                    <span className="material-symbols-rounded text-base">settings</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between px-2">
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Resumen de Niveles de Acceso</p>
                        <Link href="/dashboard/admin/roles">
                            <Button variant="ghost" size="sm" className="text-primary gap-2">
                                <span className="material-symbols-rounded text-base">open_in_new</span>
                                Gestión Avanzada
                            </Button>
                        </Link>
                    </div>
                    <Card className="p-0 border-none shadow-soft overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-border text-[10px] uppercase text-slate-400 font-black tracking-widest">
                                    <th className="p-5">Rol</th>
                                    <th className="p-5">Descripción</th>
                                    <th className="p-5 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {(allRoles as Role[]).map((role) => (
                                    <tr key={role.nombre} className="hover:bg-slate-50/30 transition-all group">
                                        <td className="p-5">
                                            <Badge variant="accent" className="px-3 py-1 uppercase tracking-widest text-[9px] font-black">{role.nombre}</Badge>
                                        </td>
                                        <td className="p-5">
                                            <p className="text-xs text-slate-500 font-medium line-clamp-1">{role.descripcion || 'Nivel de acceso estándar.'}</p>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => handleDeleteRole(role.nombre)}
                                                className="p-2 hover:bg-danger/10 text-slate-300 hover:text-danger transition-all rounded-lg"
                                            >
                                                <span className="material-symbols-rounded">delete_outline</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {/* Modal: Asignar Roles */}
            {showAssignModal && currentUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md p-0 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Configurar Permisos</h3>
                                <p className="text-xs text-slate-500 font-medium">Asigna roles para {currentUser.nombres}.</p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2.5">
                                {(allRoles as Role[]).map(role => {
                                    const isSelected = selectedRoles.includes(role.nombre);
                                    return (
                                        <div
                                            key={role.nombre}
                                            onClick={() => toggleRole(role.nombre)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-slate-100 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-slate-200'}`}>
                                                    {isSelected && <span className="material-symbols-rounded text-white text-[10px] font-black">check</span>}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-slate-600'}`}>{role.nombre}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{role.descripcion || 'Sin descripción'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Director Unit Selector (TRIAD) */}
                            {selectedRoles.includes('Director') && (
                                <div className="p-4 rounded-xl border-2 border-orange-200 bg-orange-50/30 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2 text-orange-600">
                                        <span className="material-symbols-rounded text-base font-black">apartment</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">Asignación de Unidad (Director)</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Dept */}
                                        <select
                                            className="px-3 py-2 rounded-lg border border-orange-100 bg-white text-[10px] font-bold outline-none focus:ring-2 focus:ring-orange-200"
                                            value={modalDept}
                                            onChange={(e) => {
                                                setModalDept(e.target.value);
                                                setModalDistrict('all');
                                            }}
                                        >
                                            <option value="all">Todos los Deptos.</option>
                                            {departments.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                        </select>

                                        {/* Dist */}
                                        <select
                                            className="px-3 py-2 rounded-lg border border-orange-100 bg-white text-[10px] font-bold outline-none focus:ring-2 focus:ring-orange-200"
                                            value={modalDistrict}
                                            onChange={(e) => setModalDistrict(e.target.value)}
                                        >
                                            <option value="all">Todos los Distritos</option>
                                            {modalDistrictsDropdown.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="relative">
                                            <span className="material-symbols-rounded absolute left-2 top-1/2 -translate-y-1/2 text-orange-400 text-sm">search</span>
                                            <input
                                                type="text"
                                                placeholder="Buscar unidad..."
                                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-orange-100 bg-white text-[10px] font-bold outline-none focus:ring-2 focus:ring-orange-200"
                                                value={modalUnitSearch}
                                                onChange={(e) => setModalUnitSearch(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl border border-orange-200 bg-white text-sm outline-none focus:ring-4 focus:ring-orange-100 transition-all font-bold text-slate-700 appearance-none shadow-sm"
                                            value={selectedUnitId || ''}
                                            onChange={(e) => setSelectedUnitId(e.target.value ? parseInt(e.target.value) : null)}
                                        >
                                            <option value="">Selecciona Unidad Educativa...</option>
                                            {modalUnitsDropdown.map(u => (
                                                <option key={u.id} value={u.id}>{u.nombre} ({u.distrito_nombre})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Level Selector */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Inicial', 'Primaria', 'Secundaria', 'Nocturno', 'Alternativa', 'General'].map(nivel => (
                                            <button
                                                key={nivel}
                                                type="button"
                                                onClick={() => setSelectedUnitLevel(nivel)}
                                                className={`px-2 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 transition-all ${
                                                    selectedUnitLevel === nivel 
                                                    ? 'bg-orange-500 border-orange-500 text-white' 
                                                    : 'bg-white border-orange-100 text-orange-400 hover:border-orange-200'
                                                }`}
                                            >
                                                {nivel}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-[10px] text-orange-500 font-medium leading-relaxed">
                                        * Un colegio puede tener directores distintos para cada nivel.
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowAssignModal(false)}>Cancelar</Button>
                                <Button onClick={handleSaveRoles} isLoading={saving}>Actualizar</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal: Nuevo Perfil */}
            {showCreateUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md p-0 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="p-6 border-b border-border bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-900">Añadir Nuevo Perfil</h3>
                            <p className="text-xs text-slate-500 font-medium">Registra un nuevo docente en el sistema.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombres</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/10"
                                        placeholder="Ej: Juan"
                                        value={newUser.nombres}
                                        onChange={(e) => setNewUser({...newUser, nombres: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Apellidos</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/10"
                                        placeholder="Ej: Pérez"
                                        value={newUser.apellidos}
                                        onChange={(e) => setNewUser({...newUser, apellidos: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email (Acceso)</label>
                                <input 
                                    type="email" 
                                    className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/10"
                                    placeholder="juan.perez@escuela.com"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Inicial</label>
                                <input 
                                    type="password" 
                                    className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/10"
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Roles Asignados</label>
                                <div className="flex flex-wrap gap-2">
                                    {(allRoles as Role[]).map(role => {
                                        const isSelected = newUser.roles.includes(role.nombre);
                                        return (
                                            <button
                                                key={role.nombre}
                                                type="button"
                                                onClick={() => {
                                                    setNewUser(prev => ({
                                                        ...prev,
                                                        roles: isSelected 
                                                            ? prev.roles.filter(r => r !== role.nombre)
                                                            : [...prev.roles, role.nombre]
                                                    }));
                                                }}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                                    isSelected 
                                                    ? 'bg-primary/10 border-primary text-primary' 
                                                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                                                }`}
                                            >
                                                {role.nombre}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowCreateUserModal(false)}>Cancelar</Button>
                                <Button onClick={handleCreateUser} isLoading={saving} variant="accent">Crear Cuenta</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal: Nuevo Rol */}
            {showCreateRoleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md p-0 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="p-6 border-b border-border bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-900">Añadir Nuevo Rol</h3>
                            <p className="text-xs text-slate-500 font-medium">Define un nuevo nivel de permisos.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Rol</label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/10"
                                    placeholder="Ej: Auditor"
                                    value={newRole.nombre}
                                    onChange={(e) => setNewRole({...newRole, nombre: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                                <textarea 
                                    className="w-full p-3 rounded-xl border border-border bg-white text-sm outline-none focus:ring-2 focus:ring-primary/10 min-h-[100px]"
                                    placeholder="Describe qué puede hacer este usuario..."
                                    value={newRole.descripcion}
                                    onChange={(e) => setNewRole({...newRole, descripcion: e.target.value})}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowCreateRoleModal(false)}>Cancelar</Button>
                                <Button onClick={handleCreateRole} isLoading={saving} variant="accent">Guardar Rol</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

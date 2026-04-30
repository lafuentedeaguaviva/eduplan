'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdminController } from '@/hooks/useAdminController';

interface User {
    id: string;
    nombres: string;
    apellidos: string;
    email: string;
    roles: string[];
    created_at: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const {
        users,
        roles: allRoles,
        loading,
        saving,
        error: controllerError,
        checkAccess,
        loadUsersData,
        saveUserRoles
    } = useAdminController();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                loadUsersData();
            }
        };
        init();
    }, []);

    const openEditRoles = (user: User) => {
        setCurrentUser(user);
        setSelectedRoles([...(user.roles || [])]);
        setShowModal(true);
    };

    const toggleRole = (role: string) => {
        setSelectedRoles(prev =>
            prev.includes(role)
                ? prev.filter(r => r !== role)
                : [...prev, role]
        );
    };

    const handleSaveRoles = async () => {
        if (!currentUser) return;
        const success = await saveUserRoles(currentUser.id, selectedRoles);
        if (success) {
            setShowModal(false);
            loadUsersData();
        }
    };

    const filteredUsers = (users as User[]).filter(u =>
        (u.nombres?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.apellidos?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    if (loading && users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-slate-500 font-medium animate-pulse">Cargando usuarios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all hover:scale-110">
                            <span className="material-symbols-rounded text-slate-500">arrow_back</span>
                        </button>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h1>
                    </div>
                    <p className="text-slate-500 font-medium ml-12">Administra accesos, permisos y roles del sistema.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group/search">
                        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within/search:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar docente o email..."
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all w-full md:w-80 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

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
                                <th className="p-5">Usuario / Docente</th>
                                <th className="p-5">Email</th>
                                <th className="p-5">Roles Asignados</th>
                                <th className="p-5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-slate-400">
                                        No se encontraron usuarios que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xs shadow-inner">
                                                    {user.nombres?.[0]}{user.apellidos?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{user.nombres} {user.apellidos}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Miembro desde {new Date(user.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-sm font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{user.email}</span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex flex-wrap gap-1.5">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map(role => (
                                                        <Badge key={role} variant={role === 'Administrador' ? 'accent' : 'default'}>
                                                            {role}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-slate-300 italic">Sin roles asignados</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditRoles(user)}
                                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
                                            >
                                                <span className="material-symbols-rounded text-base mr-1.5">shield_person</span>
                                                Gestionar
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Edit Roles */}
            {showModal && currentUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <Card className="w-full max-w-md p-0 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Configurar Permisos</h3>
                                <p className="text-xs text-slate-500 font-medium">Asigna o remueve roles de acceso.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 mb-6">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {currentUser.nombres?.[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">{currentUser.nombres} {currentUser.apellidos}</p>
                                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Roles disponibles</label>
                                {allRoles.map(role => {
                                    const isSelected = selectedRoles.includes(role);
                                    return (
                                        <div
                                            key={role}
                                            onClick={() => toggleRole(role)}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                                                ? 'bg-primary/5 border-primary shadow-sm'
                                                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`size-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary rotate-0' : 'border-slate-200 rotate-45'
                                                    }`}>
                                                    {isSelected && <span className="material-symbols-rounded text-white text-[10px] font-black">check</span>}
                                                </div>
                                                <span className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-slate-600'}`}>{role}</span>
                                            </div>
                                            {isSelected && <Badge variant="accent">Activo</Badge>}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-8 flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowModal(false)}
                                    className="px-6"
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleSaveRoles} isLoading={saving} className="px-8 shadow-blue-500/20">
                                    Actualizar Permisos
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}


'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminService } from '@/services/admin.service';
import { useAdminController } from '@/hooks/useAdminController';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';

interface Role {
    nombre: string;
    descripcion: string;
    userCount: number;
}

export default function AdminRolesPage() {
    const { checkAccess } = useAdminController();
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

    useEffect(() => {
        const init = async () => {
            const hasAccess = await checkAccess();
            if (hasAccess) {
                loadRoles();
            }
        };
        init();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        const res = await AdminService.getRolesWithStats();
        if (res.success) {
            setRoles(res.data || []);
        } else {
            console.error('Error loading roles:', res.error);
            toast.error('No se pudieron cargar los roles desde la base de datos');
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre.trim()) return;

        let res;
        if (editingRole) {
            res = await AdminService.updateRole(editingRole.nombre, { descripcion: formData.descripcion });
        } else {
            res = await AdminService.createRole(formData);
        }

        if (res.success) {
            toast.success(editingRole ? 'Rol actualizado' : 'Rol creado con éxito');
            setShowModal(false);
            setEditingRole(null);
            setFormData({ nombre: '', descripcion: '' });
            loadRoles();
        } else {
            toast.error('Error al guardar el rol');
        }
    };

    const handleDelete = async (nombre: string) => {
        if (!confirm(`¿Estás seguro de eliminar el rol "${nombre}"? Esta acción no se puede deshacer y podría afectar a los usuarios asociados.`)) return;

        const res = await AdminService.deleteRole(nombre);
        if (res.success) {
            toast.success('Rol eliminado');
            loadRoles();
        } else {
            toast.error('Error al eliminar el rol');
        }
    };

    const mainRole = useMemo(() => {
        if (roles.length === 0) return null;
        return [...roles].sort((a, b) => b.userCount - a.userCount)[0];
    }, [roles]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Gestión de Roles
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Define los niveles de acceso y responsabilidades de los perfiles.
                    </p>
                </div>
                <button 
                    onClick={() => {
                        setEditingRole(null);
                        setFormData({ nombre: '', descripcion: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    <span className="material-symbols-rounded">add</span>
                    <span className="font-bold">Nuevo Rol</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-indigo-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600">
                            <span className="material-symbols-rounded text-3xl">verified_user</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Roles</p>
                            <p className="text-2xl font-black text-slate-900">{roles.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-emerald-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">
                            <span className="material-symbols-rounded text-3xl">group</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Usuarios Asignados</p>
                            <p className="text-2xl font-black text-slate-900">
                                {roles.reduce((acc, r) => acc + r.userCount, 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6 border-none shadow-soft bg-gradient-to-br from-amber-50 to-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                            <span className="material-symbols-rounded text-3xl">shield_lock</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rol Predominante</p>
                            <p className="text-2xl font-black text-slate-900 truncate max-w-[150px]">
                                {mainRole?.nombre || 'Administrador'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Roles Table (Planilla) */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Sincronizando tabla de roles...</p>
                </div>
            ) : (
                <Card className="p-0 border-none shadow-soft overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-widest">
                                    <th className="p-6">Nombre del Rol</th>
                                    <th className="p-6">Descripción</th>
                                    <th className="p-6">Estado</th>
                                    <th className="p-6 text-center">Usuarios</th>
                                    <th className="p-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {roles.length > 0 ? (
                                    roles.map((role) => (
                                        <tr key={role.nombre} className="hover:bg-slate-50/30 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                                                        <span className="material-symbols-rounded text-xl">badge</span>
                                                    </div>
                                                    <span className="font-bold text-slate-900">{role.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <p className="text-sm text-slate-500 font-medium max-w-md line-clamp-2">
                                                    {role.descripcion || 'Sin descripción asignada.'}
                                                </p>
                                            </td>
                                            <td className="p-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-tighter">
                                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Activo
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                    <span className="material-symbols-rounded text-sm text-slate-400">group</span>
                                                    <span className="text-sm font-black text-slate-700">{role.userCount}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setEditingRole(role);
                                                            setFormData({ nombre: role.nombre, descripcion: role.descripcion });
                                                            setShowModal(true);
                                                        }}
                                                        className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                                                        title="Editar"
                                                    >
                                                        <span className="material-symbols-rounded">edit</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(role.nombre)}
                                                        className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <span className="material-symbols-rounded">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-rounded text-4xl text-slate-200">database_off</span>
                                                <p className="text-slate-400 font-medium">No se encontraron roles en el sistema.</p>
                                                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-black">Verifica la conexión o los permisos de base de datos</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Modal for Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg p-8 border-none shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <span className="material-symbols-rounded">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Rol</label>
                                <input 
                                    type="text" 
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all disabled:opacity-50"
                                    placeholder="Ej: Auditor, Supervisor..."
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    disabled={!!editingRole}
                                />
                                {editingRole && <p className="text-[10px] text-slate-400 font-medium px-1">El nombre del rol no puede ser modificado después de su creación.</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                                <textarea 
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-medium outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all min-h-[120px]"
                                    placeholder="Describe las responsabilidades de este rol..."
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                >
                                    {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

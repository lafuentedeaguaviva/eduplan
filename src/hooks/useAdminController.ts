'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService, Unit, District } from '@/services/admin.service';
import { AuthService } from '@/services/auth.service';
import { ProfileService } from '@/services/profile.service';

export function useAdminController() {
    const router = useRouter();
    
    // Core Admin State
    const [units, setUnits] = useState<Unit[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    
    // Curriculum State
    const [levels, setLevels] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [baseContents, setBaseContents] = useState<any[]>([]);
    
    // Library State
    const [libraryItems, setLibraryItems] = useState<any[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkAccess = async () => {
        try {
            const { data, error: sessionError } = await AuthService.getSession();
            if (sessionError || !data.session) {
                router.push('/login');
                return false;
            }

            const profile = await ProfileService.getProfile(data.session.user.id);
            const isAdmin = profile?.roles?.includes('Administrador');

            if (!isAdmin) {
                router.push('/dashboard');
                return false;
            }
            return true;
        } catch (err) {
            console.error('Access check failed:', err);
            router.push('/login');
            return false;
        }
    };

    // --- DATA LOADERS ---

    const loadUnitsData = async () => {
        setLoading(true);
        try {
            const [unitsRes, districtsRes] = await Promise.all([
                AdminService.getUnits(),
                AdminService.getDistricts()
            ]);
            if (unitsRes.data) setUnits(unitsRes.data);
            if (districtsRes.data) setDistricts(districtsRes.data);
        } finally {
            setLoading(false);
        }
    };

    const loadUsersData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                AdminService.getUsers(),
                AdminService.getRoles()
            ]);
            if (usersRes.data) setUsers(usersRes.data);
            if (rolesRes.data) setRoles(rolesRes.data);
        } finally {
            setLoading(false);
        }
    };

    const loadCurriculumData = async (nivelId?: number) => {
        setLoading(true);
        try {
            const [levelsRes, gradesRes, areasRes] = await Promise.all([
                AdminService.getNiveles(),
                AdminService.getGrados(nivelId),
                AdminService.getAreas()
            ]);
            if (levelsRes.data) setLevels(levelsRes.data);
            if (gradesRes.data) setGrades(gradesRes.data);
            if (areasRes.data) setAreas(areasRes.data);
        } finally {
            setLoading(false);
        }
    };

    const loadContentsBase = async (gradoId?: number, areaId?: number) => {
        setLoading(true);
        try {
            const res = await AdminService.getContenidosBase(gradoId, areaId);
            if (res.data) setBaseContents(res.data);
        } finally {
            setLoading(false);
        }
    };

    const loadLibraryTable = async (tableName: string) => {
        setLoading(true);
        try {
            const res = await AdminService.getLibraryTable(tableName);
            if (res.data) setLibraryItems(res.data);
        } finally {
            setLoading(false);
        }
    };

    // --- DATA PERSISTENCE ---

    const saveUnit = async (unit: Partial<Unit>, isEditing: boolean) => {
        setSaving(true);
        setError(null);
        try {
            let res;
            if (isEditing && unit.id) {
                res = await AdminService.updateUnit(unit.id, unit as any);
            } else {
                res = await AdminService.createUnit(unit as any);
            }
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar la unidad');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteUnit = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta unidad?')) return false;
        const res = await AdminService.deleteUnit(id);
        return res.success;
    };

    const saveUserRoles = async (userId: string, newRoles: string[]) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.updateUserRoles(userId, newRoles);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al actualizar roles');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const saveBaseContent = async (content: any) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.upsertContenidoBase(content);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar contenido');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const saveLibraryItem = async (tableName: string, item: any) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.upsertLibraryItem(tableName, item);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar elemento de biblioteca');
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        // State
        units,
        districts,
        users,
        roles,
        levels,
        grades,
        areas,
        baseContents,
        libraryItems,
        loading,
        saving,
        error,
        // Common
        checkAccess,
        // Loaders
        loadUnitsData,
        loadUsersData,
        loadCurriculumData,
        loadContentsBase,
        loadLibraryTable,
        // Actions
        saveUnit,
        deleteUnit,
        saveUserRoles,
        saveBaseContent,
        saveLibraryItem
    };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminService, Unit, District } from '@/services/admin.service';
import { AuthService } from '@/services/auth.service';
import { ProfileService } from '@/services/profile.service';

export function useAdminController() {
    const router = useRouter();
    const [settings, setSettings] = useState<any>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [directors, setDirectors] = useState<any[]>([]);
    
    // Curriculum State
    const [levels, setLevels] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);
    const [baseContents, setBaseContents] = useState<any[]>([]);
    
    // Library State
    const [libraryItems, setLibraryItems] = useState<any[]>([]);
    const [resourceCategories, setResourceCategories] = useState<any[]>([]);
    const [teacherResources, setTeacherResources] = useState<any[]>([]);

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

            const profileRes = await ProfileService.getProfile(data.session.user.id);
            const isAdmin = profileRes.data?.roles?.includes('Administrador');

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

    const loadGeoData = async () => {
        setLoading(true);
        try {
            const [deptsRes, districtsRes] = await Promise.all([
                AdminService.getDepartments(),
                AdminService.getDistricts()
            ]);
            if (deptsRes.data) setDepartments(deptsRes.data);
            if (districtsRes.data) setDistricts(districtsRes.data);
        } finally {
            setLoading(false);
        }
    };

    const loadUnitsData = async () => {
        setLoading(true);
        try {
            const [unitsRes, districtsRes, directorsRes] = await Promise.all([
                AdminService.getUnits(),
                AdminService.getDistricts(),
                AdminService.getDirectors()
            ]);
            if (unitsRes.data) setUnits(unitsRes.data);
            if (districtsRes.data) setDistricts(districtsRes.data);
            if (directorsRes.data) setDirectors(directorsRes.data);
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

    const loadGlobalSettings = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getGlobalSettings();
            if (res.data) setSettings(res.data);
        } finally {
            setLoading(false);
        }
    };

    const loadResourcesData = async (categoriaId?: string) => {
        setLoading(true);
        try {
            const [catsRes, resRes] = await Promise.all([
                AdminService.getResourceCategories(),
                AdminService.getTeacherResources(categoriaId)
            ]);
            
            if (catsRes.data) setResourceCategories(catsRes.data);
            if (resRes.data) setTeacherResources(resRes.data);
        } catch (err) {
            console.error('Error en loadResourcesData:', err);
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

    const saveDepartment = async (dept: any, isEditing: boolean) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.saveDepartment(dept, isEditing);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar departamento');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteDepartment = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este departamento?')) return false;
        const res = await AdminService.deleteDepartment(id);
        return res.success;
    };

    const saveDistrict = async (district: any) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.saveDistrict(district);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar distrito');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteDistrict = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este distrito?')) return false;
        const res = await AdminService.deleteDistrict(id);
        return res.success;
    };

    const saveUserRoles = async (userId: string, newRoles: string[], unitId?: number | null, unitLevel: string = 'General') => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.updateUserRoles(userId, newRoles, unitId, unitLevel);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al actualizar roles');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const saveRole = async (role: { nombre: string; descripcion: string }) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.createRole(role);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar el rol');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteRole = async (nombre: string) => {
        if (!confirm(`¿Estás seguro de eliminar el rol "${nombre}"?`)) return false;
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.deleteRole(nombre);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al eliminar el rol');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const createProfile = async (email: string, password?: string, nombres: string = '', apellidos: string = '', roles: string[] = []) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.createProfile({ email, password, nombres, apellidos, roles });
            if (!res.success) throw res.error;
            return { success: true, error: null };
        } catch (err: any) {
            const msg = err.message || 'Error al crear el perfil';
            setError(msg);
            return { success: false, error: msg };
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

    const saveGlobalSettings = async (newSettings: any) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.updateGlobalSettings(newSettings);
            if (!res.success) throw res.error;
            setSettings(res.data);
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar configuración global');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const saveResourceCategory = async (category: any) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.saveResourceCategory(category);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar categoría');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteResourceCategory = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
        setSaving(true);
        try {
            const res = await AdminService.deleteResourceCategory(id);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al eliminar categoría');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const saveTeacherResource = async (resource: any) => {
        setSaving(true);
        setError(null);
        try {
            const res = await AdminService.saveTeacherResource(resource);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al guardar recurso');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteTeacherResource = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este recurso?')) return;
        setSaving(true);
        try {
            const res = await AdminService.deleteTeacherResource(id);
            if (!res.success) throw res.error;
            return true;
        } catch (err: any) {
            setError(err.message || 'Error al eliminar recurso');
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        // State
        units,
        districts,
        departments,
        users,
        roles,
        directors,
        levels,
        grades,
        areas,
        baseContents,
        libraryItems,
        resourceCategories,
        teacherResources,
        settings,
        loading,
        saving,
        error,
        // Common
        checkAccess,
        // Loaders
        loadUnitsData,
        loadGeoData,
        loadUsersData,
        loadCurriculumData,
        loadContentsBase,
        loadLibraryTable,
        loadGlobalSettings,
        loadResourcesData,
        // Actions
        saveUnit,
        deleteUnit,
        saveDepartment,
        deleteDepartment,
        saveDistrict,
        deleteDistrict,
        saveUserRoles,
        saveRole,
        deleteRole,
        createProfile,
        saveBaseContent,
        saveLibraryItem,
        saveGlobalSettings,
        saveResourceCategory,
        deleteResourceCategory,
        saveTeacherResource,
        deleteTeacherResource
    };
}

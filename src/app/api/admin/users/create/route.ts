import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // 1. Verificar la sesión del usuario que hace la petición
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Ignorar errores de set en route handlers si no es crítico
                        }
                    },
                },
            }
        );

        const { data: adminSessionData, error: authError } = await supabase.auth.getUser();
        const adminUser = adminSessionData?.user;

        if (authError || !adminUser) {
            console.error('API Auth Error:', authError);
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // 2. Verificar que el usuario tenga el rol de 'Administrador'
        const { data: roleData, error: roleError } = await supabaseAdmin
            .from('perfil_roles')
            .select('rol_nombre')
            .eq('perfil_id', adminUser.id)
            .eq('rol_nombre', 'Administrador');

        if (roleError || !roleData || roleData.length === 0) {
            console.error('API Role Check Error:', roleError, roleData);
            return NextResponse.json({ error: 'Permisos insuficientes para realizar esta acción' }, { status: 403 });
        }

        console.log('Admin user verified:', adminUser.email);

        // 3. Proceder con la creación del nuevo usuario
        const { email, password, nombres, apellidos, roles } = await request.json();
        console.log('Creating user for:', email, 'with roles:', roles);

        if (!email || !password) {
            return NextResponse.json({ error: 'Email y contraseña son obligatorios' }, { status: 400 });
        }

        const { data: newAuthData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                nombres,
                apellidos,
                full_name: `${nombres} ${apellidos}`
            }
        });

        if (createUserError || !newAuthData?.user) {
            console.error('Auth creation error:', createUserError);
            return NextResponse.json({ error: createUserError?.message || 'Error al crear el usuario de autenticación' }, { status: 500 });
        }

        const userId = newAuthData.user.id;
        console.log('Auth user created with ID:', userId);

        // 4. Crear el perfil asociado
        const { error: profileError } = await supabaseAdmin.from('perfiles').upsert({
            id: userId,
            email,
            nombres,
            apellidos,
            updated_at: new Date().toISOString()
        });

        if (profileError) {
            console.error('Profile table error:', profileError);
            // Si falla la creación del perfil, intentamos borrar el usuario de auth para mantener consistencia
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return NextResponse.json({ error: `Error al crear el perfil: ${profileError.message}` }, { status: 500 });
        }

        // 5. Asignar roles (Por defecto 'Profesor' si no se especifican)
        const rolesToAssign = (roles && Array.isArray(roles) && roles.length > 0) 
            ? roles 
            : ['Profesor'];

        const roleInserts = rolesToAssign.map(rol => ({
            perfil_id: userId,
            rol_nombre: rol
        }));

        const { error: roleAssignmentError } = await supabaseAdmin
            .from('perfil_roles')
            .insert(roleInserts);

        if (roleAssignmentError) {
            console.error('Role assignment error:', roleAssignmentError);
        }

        console.log('User creation completed successfully');

        return NextResponse.json({ 
            success: true, 
            user: newAuthData.user,
            message: 'Usuario y perfil creados con éxito'
        });

    } catch (error: any) {
        console.error('Security critical error in Admin API:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

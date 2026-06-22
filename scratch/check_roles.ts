import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkRoles() {
    console.log('Checking roles table...');
    const { data, error } = await supabase.from('roles').select('*');
    if (error) {
        console.error('Error fetching roles:', error);
    } else {
        console.log('Roles found:', data);
    }

    console.log('Checking perfil_roles table...');
    const { data: assignments, error: err2 } = await supabase.from('perfil_roles').select('*').limit(10);
    if (err2) {
        console.error('Error fetching assignments:', err2);
    } else {
        console.log('Assignments sample:', assignments);
    }
}

checkRoles();

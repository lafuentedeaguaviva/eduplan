const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ggzmxejkcrajohzegxtb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnem14ZWprY3Jham9oemVneHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MTk3NzAsImV4cCI6MjA5MjE5NTc3MH0.vq7QIw0O8A7-PCClO-Qa3m54pSmuH1mAI4YJPtAZuzE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRoles() {
    console.log('--- DB DEBUG START ---');
    
    // Check if table exists and has rows (even if RLS blocks, we might see error)
    const { data, error, count } = await supabase
        .from('roles')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching roles:', error.message);
        console.error('Full error:', error);
    } else {
        console.log('Roles Count:', count);
        console.log('Roles Data:', data);
    }

    const { data: profiles, error: pError } = await supabase
        .from('perfiles')
        .select('id, email')
        .limit(1);
    
    console.log('Perfiles access check:', pError ? 'FAIL: ' + pError.message : 'SUCCESS');
    
    console.log('--- DB DEBUG END ---');
}

debugRoles();

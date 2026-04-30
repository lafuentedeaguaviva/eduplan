import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('d:/PDC/PDCOficial1/eduplan-pro/.env.local'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

async function checkTokens() {
    console.log("Fetching logs from Supabase REST...");
    const url = `${supabaseUrl}/rest/v1/ia_consumo_logs?select=prompt_tokens,completion_tokens,total_tokens,tipo_operacion`;
    
    const response = await fetch(url, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    
    const logs = await response.json();
    
    let prompt = 0;
    let completion = 0;
    let total = 0;
    
    logs.forEach((l: any) => {
        prompt += l.prompt_tokens || 0;
        completion += l.completion_tokens || 0;
        total += l.total_tokens || 0;
    });
    
    console.log(`Total Prompts: ${prompt}`);
    console.log(`Total Completions: ${completion}`);
    console.log(`Total Tokens: ${total}`);
    console.log(`Total Requests: ${logs.length}`);
}

checkTokens();

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/PDC/PDCOficial1/eduplan-pro/.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkTokens() {
    console.log("Fetching token logs...");
    const { data: logs, error } = await supabase.from('ia_consumo_logs').select('prompt_tokens, completion_tokens, total_tokens');
    
    if (error) {
        console.error("Error fetching logs:", error);
        return;
    }
    
    let prompt = 0;
    let completion = 0;
    let total = 0;
    
    logs.forEach(l => {
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

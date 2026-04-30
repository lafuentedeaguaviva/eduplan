import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');

const envConfig = dotenv.parse(fs.readFileSync(envPath));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("No GEMINI_API_KEY found");
    process.exit(1);
}

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
        console.log("Available Gemini Models:");
        data.models.filter((m: any) => m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent")).forEach((m: any) => {
            console.log(m.name);
        });
    } else {
        console.error("Error listing models:", data);
    }
}

listModels();

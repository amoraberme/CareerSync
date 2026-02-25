import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Read .env.local manually to avoid dotenv dependency
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function testInsert() {
    console.log("Attempting insert to", supabaseUrl);
    const response = await fetch(`${supabaseUrl}/rest/v1/webhook_logs`, {
        method: 'POST',
        headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ payload: { test: "direct_rest_insert" } })
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);
}

testInsert();

import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
});

const paymongoKey = env.PAYMONGO_SECRET_KEY;

async function checkPayments() {
    console.log("Fetching recent PayMongo payments...");
    try {
        const res = await fetch("https://api.paymongo.com/v1/payments", {
            method: "GET",
            headers: {
                "Authorization": `Basic ${Buffer.from(paymongoKey + ":").toString('base64')}`,
                "Accept": "application/json"
            }
        });
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

checkPayments();

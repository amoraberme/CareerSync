const { execSync } = require('child_process');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');

const vars = envFile.split('\n').filter(line => line.trim() && !line.startsWith('#'));

for (const line of vars) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
        try {
            console.log(`Adding ${key} to Vercel production...`);
            // Removing any pre-existing variable first to avoid "already exists" errors
            try {
                execSync(`npx vercel env rm ${key} production -y`);
            } catch (e) {
                // Ignore if it doesn't exist
            }
            execSync(`npx vercel env add ${key} production`, { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
        } catch (err) {
            console.error(`Failed to add ${key}`);
        }
    }
}
console.log("Done adding env variables.");

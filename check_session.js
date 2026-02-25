import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function checkSession() {
    const { data, error } = await supabase
        .from('payment_sessions')
        .select('*')
        .eq('id', 'c21e2e78-b47f-4582-adf3-0903855f0be5')
        .single();

    console.log("DB RESULT:");
    console.log(JSON.stringify(data, null, 2));

    if (error) console.error("Error:", error);
}

checkSession();

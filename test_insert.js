import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function testInsert() {
    console.log("Attempting insert...");
    const { data, error } = await supabase
        .from('webhook_logs')
        .insert({ payload: { test: "direct_insert_test" } })
        .select();

    if (error) {
        console.error("Insert failed:", error);
    } else {
        console.log("Insert success:", data);
    }
}

testInsert();

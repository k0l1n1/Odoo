const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function initSupabase() {
  console.log('--- Brightloop Supabase Database Setup ---');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('[Notice] SUPABASE_URL and SUPABASE_KEY not found in backend/.env.');
    console.log('To set up Supabase tables:');
    console.log('1. Go to your Supabase project dashboard -> SQL Editor');
    console.log('2. Copy and run database/schema.sql');
    console.log('3. Copy and run database/seed.sql');
    console.log('4. Add your SUPABASE_URL and SUPABASE_KEY to backend/.env');
    process.exit(0);
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`Connecting to Supabase at ${supabaseUrl}...`);
    const { data, error } = await supabase.from('subscription_plans').select('count');
    if (error && error.code !== 'PGRST116') {
      console.log('Connected to Supabase. To apply schema, run database/schema.sql in Supabase SQL editor.');
    } else {
      console.log('Supabase connection verified successfully!');
    }
    process.exit(0);
  } catch (err) {
    console.error('Supabase check:', err.message);
    process.exit(0);
  }
}

initSupabase();

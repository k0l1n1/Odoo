const path = require('path');
const { createClient } = require(path.join(__dirname, '../backend/node_modules/@supabase/supabase-js'));
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });

async function initSupabase() {
  console.log('--- Brightloop Supabase Database Setup ---');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('[Notice] SUPABASE_URL and SUPABASE_KEY not configured.');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`Testing connection to Supabase at ${supabaseUrl}...`);
    
    // Check if subscription_plans table exists
    const { data, error } = await supabase.from('subscription_plans').select('id, name').limit(5);
    if (error) {
      console.log('Supabase response:', error.message);
      if (error.code === 'PGRST205' || error.message.includes('relation') || error.message.includes('not find')) {
        console.log('\n--> NOTICE: The tables have not been created in this Supabase project yet.');
        console.log('--> To create the tables:');
        console.log('    1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/bsbuokduadmdhpjbqeqq/sql');
        console.log('    2. Copy the contents of database/schema.sql and click Run.');
        console.log('    3. Copy the contents of database/seed.sql and click Run.');
      }
    } else {
      console.log(`Supabase connection successful! Found ${data.length} subscription plans.`);
    }
  } catch (err) {
    console.error('Supabase check error:', err.message);
  }
}

initSupabase();

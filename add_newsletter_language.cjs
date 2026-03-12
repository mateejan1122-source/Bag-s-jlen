const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();
// Attempting to extract the service_role key to run DDL, or falling back to anon if not available.
// If this fails due to RLS/permissions, the user must run the ALTER TABLE manually.
const matchService = envFile.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
const SUPABASE_KEY = matchService ? matchService[1].trim() : SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function addLanguageColumn() {
  console.log('Attempting to add "language" column to newsletter_subscribers via RPC or Direct Insert...');
  // Note: Direct ALTER TABLE is usually blocked through the REST API.
  // We will run a quick RPC call if they have one, but otherwise we'll notify the user.
  // As a hack to test if the REST API allows it, we can just try a query.
  
  const { error } = await supabase.rpc('execute_sql', { sql: "ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'da';" });
  
  if (error) {
      console.error("Failed or not supported. You will need to run this command manually in the Supabase SQL Editor:\n\nALTER TABLE newsletter_subscribers ADD COLUMN language VARCHAR(10) DEFAULT 'da';\n");
      console.error(error);
  } else {
      console.log('Successfully ran RPC (if it existed)!');
  }
}

addLanguageColumn();

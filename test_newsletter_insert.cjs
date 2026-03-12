const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const SUPABASE_ANON_KEY = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1].trim();

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInsert() {
  console.log("Testing Anon Insert to newsletter_subscribers...");
  const { data, error } = await supabase.from('newsletter_subscribers').insert([
    { email: 'test_node_insert@bagsojlen.dk', language: 'da' }
  ]).select();

  if (error) {
    console.error("❌ Insertion Failed:");
    console.error(error);
  } else {
    console.log("✅ Insertion Succeeded:");
    console.log(data);
  }
}

testInsert();

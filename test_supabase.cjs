const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://uuwusedybjldjqhapioy.supabase.co';
const supabaseKey = 'sb_publishable_hf2qGn5N3EuUxyK47Jm_Jg_AQ8D1LSs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('settings').select('*').like('key', 'history_%');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Settings Data Length:', data.length);
    data.forEach(d => console.log(`${d.key}:`, d.value));
  }
}
run();

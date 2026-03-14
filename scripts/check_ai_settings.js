import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndEnableAI() {
  // Check current settings
  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['ai_chat_enabled', 'active_ai_provider', 'openai_api_key', 'groq_api_key']);

  console.log('Current AI Settings:');
  settings?.forEach(s => {
    // Mask API keys
    const val = s.key.includes('api_key') ? (s.value ? `${s.value.substring(0,8)}...` : '(not set)') : s.value;
    console.log(`  ${s.key}: ${val}`);
  });

  const aiEnabled = settings?.find(s => s.key === 'ai_chat_enabled')?.value;
  if (aiEnabled !== 'true') {
    console.log('\n⚠️ ai_chat_enabled is not set to true! Enabling it now...');
    const { error } = await supabase.from('settings').upsert(
      { key: 'ai_chat_enabled', value: 'true', category: 'api' },
      { onConflict: 'key' }
    );
    if (error) console.error('Error enabling AI chat:', error);
    else console.log('✅ ai_chat_enabled set to "true"');
  } else {
    console.log('\n✅ ai_chat_enabled is already set to "true"');
  }
}

checkAndEnableAI();

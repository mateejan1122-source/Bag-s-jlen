import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testChat() {
  console.log('=== Testing Chat Handler End-to-End ===\n');

  // 1. Get or create test session
  let sessionId;
  const testEmail = 'chattest@example.com';

  const { data: existing } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('email', testEmail)
    .order('created_at', { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    sessionId = existing[0].id;
    console.log('Using existing session:', sessionId);
  } else {
    const { data: newSess, error: sessErr } = await supabase
      .from('chat_sessions')
      .insert({ email: testEmail, name: 'Test User', status: 'open' })
      .select()
      .single();
    if (sessErr) { console.error('Session error:', sessErr); return; }
    sessionId = newSess.id;
    console.log('Created new session:', sessionId);
  }

  // 2. Insert a user message
  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    sender: 'user',
    content: 'What time do you open?'
  });

  console.log('Invoking chat-handler edge function...');

  // 3. Invoke edge function (this is what the ChatWidget does)
  const { data, error } = await supabase.functions.invoke('chat-handler', {
    body: {
      session_id: sessionId,
      user_message: 'What time do you open?',
      language: 'en'
    }
  });

  if (error) {
    console.error('\n❌ Edge function error:', JSON.stringify(error, null, 2));
  } else {
    console.log('\n✅ Edge function returned:', data);

    // 4. Fetch the latest messages from DB
    await new Promise(r => setTimeout(r, 1000));
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('sender, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('\nLatest messages:');
    messages?.reverse().forEach(m => console.log(`  [${m.sender}]: ${m.content?.substring(0, 80)}...`));
  }
}

testChat();

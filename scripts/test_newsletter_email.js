import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmail() {
  console.log('Invoking send-booking-email with newsletter_welcome type...');
  
  const { data, error } = await supabase.functions.invoke('send-booking-email', {
    body: {
      type: 'newsletter_welcome',
      email: 'test@example.com', // Change this to a real email to test actual delivery if needed
      language: 'da',
      name: ''
    },
    headers: {
      Authorization: `Bearer ${supabaseKey}`
    }
  });

  if (error) {
    console.error('Edge function failed:', error);
  } else {
    console.log('Edge function response:', data);
  }
}

testEmail();

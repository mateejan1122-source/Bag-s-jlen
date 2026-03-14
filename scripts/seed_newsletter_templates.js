import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedNewsletterTemplates() {
  const templates = [
    {
      key: 'email_template_newsletter_welcome_da_subject',
      value: 'Velkommen til Restaurant Bag Søjlen! 🍷',
      category: 'email_template'
    },
    {
      key: 'email_template_newsletter_welcome_da_body',
      value: '<p>Hej,</p><p>Tak fordi du har tilmeldt dig vores nyhedsbrev! Vi er utrolig glade for at have dig med i vores fællesskab.</p><p>Du vil fremover være blandt de første til at høre om:</p><ul><li>Nye spændende menuer fra vores dansk-franske køkken</li><li>Eksklusive arrangementer og vinaftener</li><li>Særlige tilbud og nyheder direkte fra restauranten</li></ul><p>Vi glæder os meget til at byde dig velkommen i hyggelige omgivelser i Rønde snart.</p><p>Med venlig hilsen,<br><strong>Teamet hos Restaurant Bag Søjlen</strong></p>',
      category: 'email_template'
    },
    {
      key: 'email_template_newsletter_welcome_en_subject',
      value: 'Welcome to Restaurant Bag Søjlen! 🍷',
      category: 'email_template'
    },
    {
      key: 'email_template_newsletter_welcome_en_body',
      value: '<p>Hello,</p><p>Thank you for subscribing to our newsletter! We are delighted to have you join our community.</p><p>From now on, you\'ll be among the first to hear about:</p><ul><li>Exciting new menus from our Danish-French kitchen</li><li>Exclusive events and wine tastings</li><li>Special offers and news directly from the restaurant</li></ul><p>We look forward to welcoming you soon for an unforgettable dining experience in Rønde.</p><p>Best regards,<br><strong>The Restaurant Bag Søjlen Team</strong></p>',
      category: 'email_template'
    },
    {
      key: 'email_template_newsletter_welcome_de_subject',
      value: 'Willkommen im Restaurant Bag Søjlen! 🍷',
      category: 'email_template'
    },
    {
      key: 'email_template_newsletter_welcome_de_body',
      value: '<p>Hallo,</p><p>vielen Dank für die Anmeldung zu unserem Newsletter! Wir freuen uns sehr, Sie in unserer Community begrüßen zu dürfen.</p><p>Ab sofort gehören Sie zu den Ersten, die informiert werden über:</p><ul><li>Neue spannende Menüs aus unserer dänisch-französischen Küche</li><li>Exklusive Veranstaltungen und Weinverkostungen</li><li>Besondere Angebote und Neuigkeiten direkt aus dem Restaurant</li></ul><p>Wir freuen uns darauf, Sie bald zu einem unvergesslichen Essen in Rønde begrüßen zu dürfen.</p><p>Mit freundlichen Grüßen,<br><strong>Ihr Team vom Restaurant Bag Søjlen</strong></p>',
      category: 'email_template'
    }
  ];

  console.log('Inserting templates...');
  const { error } = await supabase.from('settings').upsert(templates, { onConflict: 'key' });
  
  if (error) {
    console.error('Error inserting templates:', error.message);
  } else {
    console.log('Successfully inserted default newsletter templates!');
  }
}

seedNewsletterTemplates();

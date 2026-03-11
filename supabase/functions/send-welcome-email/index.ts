import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const emailTemplates = {
  da: {
    subject: "Tak for din tilmelding!",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #1a1a1a;">
        <h1 style="color: #CDA235; font-style: italic;">Velkommen til Restaurant Bag Søjlen</h1>
        <p>Tak for din tilmelding til vores nyhedsbrev!</p>
        <p>Du vil nu modtage de seneste nyheder og eksklusive tilbud direkte i din indbakke.</p>
        <br/>
        <p style="font-size: 12px; color: #666;">Restaurant Bag Søjlen<br/>Hovedgaden 5, 8410 Rønde</p>
      </div>
    `,
  },
  en: {
    subject: "Thank you for subscribing!",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #1a1a1a;">
        <h1 style="color: #CDA235; font-style: italic;">Welcome to Restaurant Bag Søjlen</h1>
        <p>Thank you for subscribing to our newsletter!</p>
        <p>You will now receive the latest news and exclusive offers straight to your inbox.</p>
        <br/>
        <p style="font-size: 12px; color: #666;">Restaurant Bag Søjlen<br/>Hovedgaden 5, 8410 Rønde</p>
      </div>
    `,
  },
  de: {
    subject: "Danke für Ihre Anmeldung!",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #1a1a1a;">
        <h1 style="color: #CDA235; font-style: italic;">Willkommen im Restaurant Bag Søjlen</h1>
        <p>Danke für Ihre Anmeldung zu unserem Newsletter!</p>
        <p>Sie erhalten nun die neuesten Nachrichten und exklusive Angebote direkt in Ihren Posteingang.</p>
        <br/>
        <p style="font-size: 12px; color: #666;">Restaurant Bag Søjlen<br/>Hovedgaden 5, 8410 Rønde</p>
      </div>
    `,
  }
};

serve(async (req) => {
  try {
    const { record } = await req.json();
    
    // Webhook delivers the newly inserted row as 'record'
    if (!record || !record.email) {
      return new Response("No email provided", { status: 400 });
    }

    const { email, language } = record;
    
    // Map to supported template (fallback to da)
    const langKey = (language && emailTemplates[language]) ? language : 'da';
    const template = emailTemplates[langKey];

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // UPDATE THIS to your verified domain e.g., "info@bagsojlen.dk"
        from: "Restaurant Bag Søjlen <onboarding@resend.dev>", 
        to: [email],
        subject: template.subject,
        html: template.html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error processing request:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

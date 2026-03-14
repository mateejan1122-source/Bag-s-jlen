import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "npm:@supabase/supabase-js";

const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";

// HTML Email Templates
const generateEmailHtml = (type: string, data: any, lang: string) => {
    const isDan = lang === 'da';

    let subject = "";
    let title = "";
    let body = "";

    if (type === 'confirmation') {
        subject = isDan ? "Din reservation er bekræftet" : "Your reservation is confirmed";
        title = subject;
        body = isDan 
            ? `<p>Kære ${data.name},</p><p>Tak fordi du valgte Restaurant Bag Søjlen. Din reservation er nu bekræftet for <strong>${data.guests} personer</strong> den <strong>${data.date} kl. ${data.time}</strong>.</p><p>Vi glæder os til at byde dig velkommen!</p>`
            : `<p>Dear ${data.name},</p><p>Thank you for choosing Restaurant Bag Søjlen. Your reservation is now confirmed for <strong>${data.guests} people</strong> on <strong>${data.date} at ${data.time}</strong>.</p><p>We look forward to welcoming you!</p>`;
    } else if (type === 'rejection') {
        subject = isDan ? "Vedrørende din reservation" : "Regarding your reservation";
        title = isDan ? "Reservation Desværre Ikke Mulig" : "Reservation Unfortunately Not Possible";
        body = isDan 
            ? `<p>Kære ${data.name},</p><p>Vi er kede af at måtte meddele, at vi desværre ikke har plads til din anmodede reservation den <strong>${data.date} kl. ${data.time}</strong>.</p><p>Du er meget velkommen til at prøve en anden dato eller tidspunkt via vores hjemmeside.</p>`
            : `<p>Dear ${data.name},</p><p>We are sorry to inform you that we unfortunately cannot accommodate your requested reservation on <strong>${data.date} at ${data.time}</strong>.</p><p>You are more than welcome to try another date or time via our website.</p>`;
    } else if (type === 'reminder') {
        subject = isDan ? "Husk din reservation i aften" : "Reminder: Your reservation today";
        title = isDan ? "Påmindelse om din reservation" : "Reservation Reminder";
        body = isDan
            ? `<p>Kære ${data.name},</p><p>Vi minder dig venligst om din reservation hos Restaurant Bag Søjlen i dag. Vi pakker bord til <strong>${data.guests} personer</strong> kl. <strong>${data.time}</strong>.</p><p>Vi glæder os til at se dig!</p>`
            : `<p>Dear ${data.name},</p><p>This is a friendly reminder about your reservation at Restaurant Bag Søjlen today for <strong>${data.guests} people</strong> at <strong>${data.time}</strong>.</p><p>We look forward to seeing you!</p>`;
    } else if (type === 'cancellation') {
       subject = isDan ? "Bekræftelse på annullering" : "Cancellation Confirmation";
       title = isDan ? "Reservation Annulleret" : "Reservation Cancelled";
       body = isDan
           ? `<p>Kære ${data.name},</p><p>Din reservation den <strong>${data.date} kl. ${data.time}</strong> er nu blevet annulleret.</p><p>Vi håber at se dig en anden gang.</p>`
           : `<p>Dear ${data.name},</p><p>Your reservation on <strong>${data.date} at ${data.time}</strong> has now been cancelled.</p><p>We hope to see you another time.</p>`;
    } else if (type === 'newsletter_welcome') {
       if (lang === 'de') {
           subject = "Danke für Ihre Anmeldung!";
           title = "Willkommen bei Restaurant Bag Søjlen";
           body = `<p>Danke für Ihre Anmeldung zu unserem Newsletter!</p><p>Sie erhalten nun die neuesten Nachrichten und exklusive Angebote direkt in Ihren Posteingang.</p>`;
       } else if (lang === 'en') {
           subject = "Thank you for subscribing!";
           title = "Welcome to Restaurant Bag Søjlen";
           body = `<p>Thank you for subscribing to our newsletter!</p><p>You will now receive the latest news and exclusive offers straight to your inbox.</p>`;
       } else {
           subject = "Tak for din tilmelding!";
           title = "Velkommen til Restaurant Bag Søjlen";
           body = `<p>Tak for din tilmelding til vores nyhedsbrev!</p><p>Du vil nu modtage de seneste nyheder og eksklusive tilbud direkte i din indbakke.</p>`;
       }
    }

    const html = `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #CDA235; font-style: italic; border-bottom: 1px solid #eee; padding-bottom: 20px;">Restaurant Bag Søjlen</h1>
            <h2 style="color: #1a1a1a; margin-top: 30px;">${title}</h2>
            <div style="text-align: left; font-size: 16px; line-height: 1.6; margin: 30px 0;">
                ${body}
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                <p>Restaurant Bag Søjlen<br/>Hovedgaden 5, 8410 Rønde</p>
                <p><a href="mailto:info@bagsojlen.dk" style="color: #CDA235; text-decoration: none;">info@bagsojlen.dk</a> | Tlf: +45 8637 3500</p>
            </div>
        </div>
    `;

    return { subject, html };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { type, email, name, date, time, guests, language } = await req.json();

        if (!email || !type) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
        }

        if (!SMTP_HOSTNAME || !SMTP_USERNAME || !SMTP_PASSWORD) {
             return new Response(JSON.stringify({ error: "SMTP credentials not configured in edge function secrets." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
        }

        const fallbackTemplate = generateEmailHtml(type, { name, date, time, guests }, language || 'da');
        
        let finalSubject = fallbackTemplate.subject;
        let finalHtml = fallbackTemplate.html;

        try {
            const subjectKey = `email_template_${type}_${language || 'da'}_subject`;
            const bodyKey = `email_template_${type}_${language || 'da'}_body`;

            const { data: stringData, error: dbErr } = await supabase
                .from('settings')
                .select('key, value')
                .in('key', [subjectKey, bodyKey]);

            if (!dbErr && stringData && stringData.length > 0) {
                const subjectRow = stringData.find(s => s.key === subjectKey);
                const bodyRow = stringData.find(s => s.key === bodyKey);
                
                if (subjectRow && subjectRow.value.trim() !== '') {
                    finalSubject = subjectRow.value
                        .replace(/{name}/g, name)
                        .replace(/{date}/g, date)
                        .replace(/{time}/g, time)
                        .replace(/{guests}/g, guests);
                }
                
                if (bodyRow && bodyRow.value.trim() !== '') {
                    const parsedBody = bodyRow.value
                        .replace(/{name}/g, name)
                        .replace(/{date}/g, date)
                        .replace(/{time}/g, time)
                        .replace(/{guests}/g, guests);
                        
                    finalHtml = `
                        <div style="font-family: Arial, sans-serif; text-align: center; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h1 style="color: #CDA235; font-style: italic; border-bottom: 1px solid #eee; padding-bottom: 20px;">Restaurant Bag Søjlen</h1>
                            <div style="text-align: left; font-size: 16px; line-height: 1.6; margin: 30px 0;">
                                ${parsedBody}
                            </div>
                            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                                <p>Restaurant Bag Søjlen<br/>Hovedgaden 5, 8410 Rønde</p>
                                <p><a href="mailto:info@bagsojlen.dk" style="color: #CDA235; text-decoration: none;">info@bagsojlen.dk</a> | Tlf: +45 8637 3500</p>
                            </div>
                        </div>
                    `;
                }
            }
        } catch (dbEx) {
            console.error("Failed to query custom templates", dbEx);
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOSTNAME,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465, // true for 465, false for other ports
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Restaurant Bag Søjlen" <${SMTP_USERNAME}>`,
            to: email,
            subject: finalSubject,
            html: finalHtml,
        });

        return new Response(JSON.stringify({ success: true, message: `Email (${type}) sent to ${email}` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        console.error("Error sending email:", err);
        return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
});

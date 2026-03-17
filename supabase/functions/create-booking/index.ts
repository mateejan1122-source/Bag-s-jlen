import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "npm:@supabase/supabase-js";

const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
// Use service role key for accurate counts (bypasses RLS)
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Generate unique random Order ID (e.g. BS-12345) ────────────────────
const generateOrderId = () => {
    const random = Math.floor(Math.random() * 90000 + 10000);
    return `BS-${random}`;
};

// ─── Default email templates (fallback if admin hasn't configured custom ones) ──
const generateFallbackEmail = (type: string, data: any, lang: string) => {
    const isDan = lang === 'da';
    const isDe = lang === 'de';

    let subject = "";
    let body = "";

    if (type === 'confirmation') {
        subject = isDan ? "Din reservation er bekræftet" : isDe ? "Ihre Reservierung ist bestätigt" : "Your reservation is confirmed";
        body = isDan
            ? `<p>Kære ${data.name},</p><p>Tak fordi du valgte Restaurant Bag Søjlen. Din reservation er nu bekræftet for <strong>${data.guests} personer</strong> den <strong>${data.date} kl. ${data.time}</strong>.</p><p>Vi glæder os til at byde dig velkommen!</p>`
            : isDe
            ? `<p>Liebe/r ${data.name},</p><p>Vielen Dank, dass Sie sich für Restaurant Bag Søjlen entschieden haben. Ihre Reservierung ist nun bestätigt für <strong>${data.guests} Personen</strong> am <strong>${data.date} um ${data.time}</strong>.</p><p>Wir freuen uns auf Ihren Besuch!</p>`
            : `<p>Dear ${data.name},</p><p>Thank you for choosing Restaurant Bag Søjlen. Your reservation is now confirmed for <strong>${data.guests} people</strong> on <strong>${data.date} at ${data.time}</strong>.</p><p>We look forward to welcoming you!</p>`;
    } else if (type === 'rejection') {
        subject = isDan ? "Vedrørende din reservation" : isDe ? "Bezüglich Ihrer Reservierung" : "Regarding your reservation";
        body = isDan
            ? `<p>Kære ${data.name},</p><p>Vi er kede af at måtte meddele, at vi desværre ikke har plads til din anmodede reservation den <strong>${data.date} kl. ${data.time}</strong>.</p><p>Du er meget velkommen til at prøve en anden dato eller tidspunkt via vores hjemmeside.</p>`
            : isDe
            ? `<p>Liebe/r ${data.name},</p><p>Es tut uns leid, Ihnen mitteilen zu müssen, dass wir Ihre gewünschte Reservierung am <strong>${data.date} um ${data.time}</strong> leider nicht berücksichtigen können.</p><p>Sie sind herzlich eingeladen, über unsere Website ein anderes Datum oder eine andere Uhrzeit zu versuchen.</p>`
            : `<p>Dear ${data.name},</p><p>We are sorry to inform you that we cannot accommodate your requested reservation on <strong>${data.date} at ${data.time}</strong>.</p><p>You are welcome to try another date or time via our website.</p>`;
    }

    return { subject, body };
};

const wrapEmailHtml = (body: string) => `
    <div style="font-family: Arial, sans-serif; text-align: center; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #CDA235; font-style: italic; border-bottom: 1px solid #eee; padding-bottom: 20px;">Restaurant Bag Søjlen</h1>
        <div style="text-align: left; font-size: 16px; line-height: 1.6; margin: 30px 0;">${body}</div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Restaurant Bag Søjlen<br/>Hovedgaden 5, 8410 Rønde</p>
            <p><a href="mailto:info@bagsojlen.dk" style="color: #CDA235; text-decoration: none;">info@bagsojlen.dk</a> | Tlf: +45 8637 3500</p>
        </div>
    </div>`;

// ─── Send email with admin template support ─────────────────────────────
const sendEmailWithTemplate = async (
    supabase: any,
    to: string,
    type: string,
    data: { name: string; date: string; time: string; guests: number; order_id?: string },
    lang: string
) => {
    if (!SMTP_HOSTNAME || !SMTP_USERNAME || !SMTP_PASSWORD) {
        console.error("SMTP credentials not configured — skipping email");
        return;
    }

    // Start with fallback template
    const fallback = generateFallbackEmail(type, data, lang);
    let finalSubject = fallback.subject;
    let finalHtml = wrapEmailHtml(fallback.body);

    // ── Try to load admin-configured template from settings ──────────────
    try {
        const subjectKey = `email_template_${type}_${lang}_subject`;
        const bodyKey = `email_template_${type}_${lang}_body`;

        const { data: templateRows, error: dbErr } = await supabase
            .from('settings')
            .select('key, value')
            .in('key', [subjectKey, bodyKey]);

        if (!dbErr && templateRows && templateRows.length > 0) {
            const subjectRow = templateRows.find((s: any) => s.key === subjectKey);
            const bodyRow = templateRows.find((s: any) => s.key === bodyKey);

            if (subjectRow && subjectRow.value.trim() !== '') {
                finalSubject = subjectRow.value
                    .replace(/{name}/g, data.name)
                    .replace(/{date}/g, data.date)
                    .replace(/{time}/g, data.time)
                    .replace(/{guests}/g, String(data.guests))
                    .replace(/{order_id}/g, data.order_id || '');
            }

            if (bodyRow && bodyRow.value.trim() !== '') {
                const parsedBody = bodyRow.value
                    .replace(/{name}/g, data.name)
                    .replace(/{date}/g, data.date)
                    .replace(/{time}/g, data.time)
                    .replace(/{guests}/g, String(data.guests))
                    .replace(/{order_id}/g, data.order_id || '');

                finalHtml = wrapEmailHtml(parsedBody);
            }
        }
    } catch (dbEx) {
        console.error("Failed to query admin email templates, using fallback:", dbEx);
    }

    // ── Send the email ──────────────────────────────────────────────────
    const transporter = nodemailer.createTransport({
        host: SMTP_HOSTNAME,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USERNAME, pass: SMTP_PASSWORD },
    });

    await transporter.sendMail({
        from: `"Restaurant Bag Søjlen" <${SMTP_USERNAME}>`,
        to,
        subject: finalSubject,
        html: finalHtml,
    });

    console.log(`Email (${type}) sent to ${to}`);
};

// ─── Main handler ──────────────────────────────────────────────────────
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { date, time, guests, fullName, email, phone, specialRequests, language } = await req.json();

        if (!date || !time || !email || !fullName) {
            return new Response(JSON.stringify({ success: false, error: "Missing required fields" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const lang = language || 'da';

        // ── 1. Read total_tables setting ─────────────────────────────────
        let totalTables = 100;
        try {
            const { data: tablesSetting } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'total_tables')
                .single();
            if (tablesSetting?.value) {
                const v = parseInt(tablesSetting.value, 10);
                if (!isNaN(v) && v > 0) totalTables = v;
            }
        } catch (e) {
            console.error("Failed to read total_tables, using default:", totalTables);
        }

        console.log(`[create-booking] Table limit: ${totalTables}, checking slot ${date} ${time}`);

        // ── 2. Count confirmed bookings for this exact date + time ───────
        const { count, error: countError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('date', date)
            .eq('time', time)
            .eq('status', 'confirmed');

        if (countError) {
            console.error("Count query error:", countError);
            throw new Error("Failed to check availability: " + countError.message);
        }

        const currentCount = count || 0;
        console.log(`[create-booking] Current bookings for ${date} ${time}: ${currentCount}/${totalTables}`);

        // ── 3. REJECT if at or over capacity ─────────────────────────────
        if (currentCount >= totalTables) {
            console.log(`[create-booking] REJECTED — slot is full (${currentCount}/${totalTables})`);

            // Send rejection email using admin template
            try {
                await sendEmailWithTemplate(supabase, email, 'rejection', {
                    name: fullName, date, time, guests
                }, lang);
            } catch (emailErr) {
                console.error("Failed to send rejection email:", emailErr);
            }

            const isDan = lang === 'da';
            const isDe = lang === 'de';
            return new Response(JSON.stringify({
                success: false,
                rejected: true,
                error: isDan
                    ? "Beklager, dette tidspunkt er nu fuldt booket. Vælg venligst et andet tidspunkt."
                    : isDe
                    ? "Leider ist dieser Zeitraum jetzt ausgebucht. Bitte wählen Sie eine andere Zeit."
                    : "Sorry, this time slot is now fully booked. Please select a different time."
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
            });
        }

        // ── 4. INSERT the booking ────────────────────────────────────────
        const order_id = generateOrderId();
        const { data: insertedBooking, error: insertError } = await supabase
            .from('bookings')
            .insert([{
                date, time, guests, fullName, email, phone,
                specialRequests: specialRequests || '',
                status: 'confirmed',
                order_id
            }])
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            throw new Error("Failed to create booking: " + insertError.message);
        }

        console.log(`[create-booking] SUCCESS — booking created, now ${currentCount + 1}/${totalTables}`);

        // ── 5. Send confirmation email using admin template ──────────────
        try {
            await sendEmailWithTemplate(supabase, email, 'confirmation', {
                name: fullName, date, time, guests, order_id
            }, lang);
        } catch (emailErr) {
            console.error("Failed to send confirmation email:", emailErr);
            // Non-blocking — booking is already saved
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Booking confirmed",
            bookingId: insertedBooking?.id,
            orderId: order_id,
            remaining: totalTables - currentCount - 1
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
        });

    } catch (err) {
        console.error("Error in create-booking:", err);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
        });
    }
});

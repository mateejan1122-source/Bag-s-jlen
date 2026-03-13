import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer";
import { createClient } from "npm:@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SMTP_HOSTNAME = Deno.env.get("SMTP_HOSTNAME") || "";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "465");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME") || "";
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { session_id } = await req.json();

        if (!session_id) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
        }

        if (!SMTP_HOSTNAME || !SMTP_USERNAME || !SMTP_PASSWORD) {
            return new Response(JSON.stringify({ error: "SMTP credentials not configured." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
        }

        // 1. Fetch Session Info
        const { data: sessionInfo, error: sessionErr } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('id', session_id)
            .single();

        if (sessionErr || !sessionInfo) {
            throw new Error("Could not find session");
        }

        // 2. Fetch all messages
        const { data: messages, error: msgErr } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', session_id)
            .order('created_at', { ascending: true });

        if (msgErr || !messages || messages.length === 0) {
            throw new Error("Could not fetch messages or session is empty");
        }

        // 3. Build HTML Transcript
        let htmlTranscript = `
        <div style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
                <h1 style="color: #CDA235; font-style: italic; margin: 0;">Restaurant Bag Søjlen</h1>
                <h2 style="color: #666; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Chat Transcript</h2>
            </div>
            
            <p>Dear ${sessionInfo.name},</p>
            <p>Here is a copy of your recent chat with us on ${new Date(sessionInfo.created_at).toLocaleDateString()}:</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 30px 0;">
        `;

        messages.forEach(msg => {
            const isUser = msg.sender === 'user';
            const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const name = isUser ? sessionInfo.name : msg.sender === 'ai' ? 'AI Assistant' : 'Restaurant Bag Søjlen';
            const color = isUser ? '#CDA235' : '#1a1a1a';
            
            htmlTranscript += `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 11px; color: #999; text-transform: uppercase;">
                        <strong style="color: ${color};">${name}</strong> • ${time}
                    </div>
                    <div style="font-size: 14px; margin-top: 4px; line-height: 1.5;">
                        ${msg.content}
                    </div>
                </div>
            `;
        });

        htmlTranscript += `
            </div>
            
            <p>If you need further assistance, please feel free to reply directly to this email.</p>

            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
                <p>Restaurant Bag Søjlen<br/>Hovedgaden 5, 8410 Rønde</p>
                <p><a href="mailto:info@bagsojlen.dk" style="color: #CDA235; text-decoration: none;">info@bagsojlen.dk</a> | Tlf: +45 8637 3500</p>
            </div>
        </div>
        `;

        // 4. Send Email
        const transporter = nodemailer.createTransport({
            host: SMTP_HOSTNAME,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
                user: SMTP_USERNAME,
                pass: SMTP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Restaurant Bag Søjlen" <${SMTP_USERNAME}>`,
            to: sessionInfo.email,
            subject: "Your Chat Transcript - Restaurant Bag Søjlen",
            html: htmlTranscript,
        });

        return new Response(JSON.stringify({ success: true, message: "Transcript sent." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        console.error("Error sending transcript:", err);
        return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
});

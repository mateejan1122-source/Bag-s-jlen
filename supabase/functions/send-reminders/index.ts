import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        // 1. Get the configurable reminder hours from settings (default: 5 hours)
        const { data: settingRow } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'reminder_hours_before')
            .single();

        const hoursBeforeReminder = parseInt(settingRow?.value || '5', 10);

        const now = new Date();
        // Target window: [now + hoursBeforeReminder - 15min, now + hoursBeforeReminder + 15min]
        const windowStart = new Date(now.getTime() + (hoursBeforeReminder * 60 - 15) * 60 * 1000);
        const windowEnd   = new Date(now.getTime() + (hoursBeforeReminder * 60 + 15) * 60 * 1000);

        const windowStartStr = windowStart.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
        const windowEndStr   = windowEnd.toISOString().slice(0, 16);

        // 2. Find confirmed bookings whose datetime falls in the window and haven't been reminded yet
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('status', 'confirmed')
            .is('reminder_sent_at', null); // Only send once

        if (error) throw error;

        let sentCount = 0;

        for (const booking of bookings || []) {
            // Combine date + time into a datetime string "YYYY-MM-DDTHH:MM"
            const bookingDt = `${booking.date}T${booking.time.slice(0, 5)}`;
            if (bookingDt >= windowStartStr && bookingDt <= windowEndStr) {
                // Send reminder email
                try {
                    await supabase.functions.invoke('send-booking-email', {
                        body: {
                            type: 'reminder',
                            name: booking.fullName,
                            email: booking.email,
                            date: booking.date,
                            time: booking.time,
                            guests: booking.guests,
                            language: 'da'
                        }
                    });

                    // Mark as reminded so it won't fire again
                    await supabase
                        .from('bookings')
                        .update({ reminder_sent_at: new Date().toISOString() })
                        .eq('id', booking.id);

                    sentCount++;
                    console.log(`Reminder sent to ${booking.email} for ${booking.date} ${booking.time}`);
                } catch (emailErr) {
                    console.error(`Failed to send reminder to ${booking.email}:`, emailErr);
                }
            }
        }

        return new Response(
            JSON.stringify({ success: true, reminders_sent: sentCount }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (err: any) {
        console.error("send-reminders error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});

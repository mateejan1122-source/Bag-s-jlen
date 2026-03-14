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
        let { session_id, user_message, audio_base64, language } = await req.json();

        if (!session_id || (!user_message && !audio_base64)) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
        }

        // 1. Fetch settings from Database
        const { data: stgsData } = await supabase.from('settings').select('key, value');
        const stgs: Record<string, string> = {};
        stgsData?.forEach(s => stgs[s.key] = s.value);

        const aiEnabled = stgs['ai_chat_enabled'] === 'true';
        const activeProvider = stgs['active_ai_provider'] || 'openai';
        const enableVoice = stgs['enable_voice_replies'] === 'true';
        const oaiKey = stgs['openai_api_key'];
        const groqKey = stgs['groq_api_key'];
        const deepseekKey = stgs['deepseek_api_key'];
        const eLabsKey = stgs['elevenlabs_api_key'];

        if (!aiEnabled) {
            return new Response(JSON.stringify({ message: "AI disabled." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // 2. Transcription via Whisper (Groq is faster, but OpenAI is standard. Let's use OpenAI if available, else Groq)
        if (audio_base64) {
            const binary = atob(audio_base64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) { bytes[i] = binary.charCodeAt(i); }
            const file = new File([bytes], 'audio.webm', { type: 'audio/webm' });

            const formData = new FormData();
            formData.append('file', file);

            let whisperRes;
            // Since DeepSeek does not have a native Whisper endpoint, we will fallback to Groq or OpenAI for transcription
            if ((activeProvider === 'groq' || activeProvider === 'deepseek') && groqKey) {
                formData.append('model', 'whisper-large-v3');
                whisperRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${groqKey}` },
                    body: formData
                });
            } else if (oaiKey) {
                formData.append('model', 'whisper-1');
                whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${oaiKey}` },
                    body: formData
                });
            } else {
                throw new Error("No API key available for Whisper transcription");
            }

            const transData = await whisperRes.json();
            if (!whisperRes.ok) throw new Error(transData.error?.message || "Transcription failed");
            
            user_message = transData.text || "Unintelligible audio";
            
            // Because optimistic UI doesn't work for audio (since we don't know the text), we save the user's audio text here
            await supabase.from('chat_messages').insert({ session_id, sender: 'user', content: user_message });
        }

        // 3. Prepare Chat Context
        const { data: history } = await supabase.from('chat_messages').select('sender, content').eq('session_id', session_id).order('created_at', { ascending: true }).limit(10);
        
        const tools = [
            {
                type: "function",
                function: {
                    name: "book_table",
                    description: "Book a table for a guest at the restaurant. Automatically defaults to 'pending' status.",
                    parameters: {
                        type: "object",
                        properties: {
                            guests: { type: "integer", description: "Number of guests" },
                            date: { type: "string", description: "Date of reservation in YYYY-MM-DD format" },
                            time: { type: "string", description: "Time of reservation in HH:MM format" }
                        },
                        required: ["guests", "date", "time"]
                    }
                }
            }
        ];

        const systemPrompt = `You are the official concierge for "Restaurant Bag Søjlen", a premium French/Danish historic restaurant located in Rønde, Denmark. 
        Tone: polite, professional, welcoming. 
        Reply elegantly and briefly. Language: ${language || 'English'}.
        If the user wants to book a table, use the book_table function. Do not ask for their name/email, we already have it.`;

        const messages = [{ role: "system", content: systemPrompt }];
        history?.forEach(msg => messages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content.replace(/\[AUDIO:.*?\]/, '') }));
        
        // If it was just audio, history already has the inserted user_message. If it's text, we append it now since the frontend saved it optimistically.
        if (!audio_base64 && user_message) {
            // Check if it's already in history
            if (!history || history[history.length-1]?.content !== user_message) {
               messages.push({ role: "user", content: user_message });
            }
        }

        // 4. Call LLM (OpenAI, Groq, or DeepSeek)
        let apiUrl = 'https://api.openai.com/v1/chat/completions';
        let apiKey = oaiKey;
        let model = 'gpt-4o-mini';

        if (activeProvider === 'groq') {
            apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
            apiKey = groqKey;
            model = 'llama-3.3-70b-versatile';
        } else if (activeProvider === 'deepseek') {
            apiUrl = 'https://api.deepseek.com/chat/completions';
            apiKey = deepseekKey;
            model = 'deepseek-chat';
        }

        if (!apiKey) throw new Error(`${activeProvider} API Key missing in settings.`);

        let chatRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                tools,
                tool_choice: "auto",
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const chatData = await chatRes.json();
        if (!chatRes.ok) throw new Error(chatData.error?.message || "LLM API Error");

        let responseMsg = chatData.choices[0].message;

        // 5. Handle Function Calling (Reservation)
        if (responseMsg.tool_calls) {
            const toolCall = responseMsg.tool_calls[0];
            if (toolCall.function.name === 'book_table') {
                const args = JSON.parse(toolCall.function.arguments);
                
                // Fetch the user's name and email from session_info
                const { data: sess } = await supabase.from('chat_sessions').select('name, email').eq('id', session_id).single();

                // Save to database as pending
                await supabase.from('bookings').insert({
                    fullName: sess?.name || 'Chat Guest',
                    email: sess?.email || 'chat@guest',
                    phone: '',
                    guests: args.guests,
                    date: args.date,
                    time: args.time,
                    status: 'confirmed',
                    specialRequests: 'Booked via AI Chat Assistant'
                });

                // Append function result and call LLM again
                messages.push(responseMsg);
                messages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ success: true, status: "confirmed", message: "Reservation confirmed successfully." })
                });

                const secondRes = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model, messages, temperature: 0.7 })
                });
                const secData = await secondRes.json();
                responseMsg = secData.choices[0].message;
            }
        }

        let finalAnswerText = responseMsg.content || "I have processed your request.";
        let finalOutput = finalAnswerText;

        // 6. Generate Text-to-Speech (ElevenLabs)
        if (enableVoice && eLabsKey) {
            try {
                // Rachel default voice ID
                const voiceId = "21m00Tcm4TlvDq8ikWAM"; 
                const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': eLabsKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: finalAnswerText,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                    })
                });

                if (ttsRes.ok) {
                    const audioBlob = await ttsRes.blob();
                    const fileName = `${session_id}_${Date.now()}.mp3`;
                    
                    // Upload to Supabase Storage
                    const { data: uploadData, error: uploadErr } = await supabase.storage.from('chat_audio').upload(fileName, audioBlob, {
                        contentType: 'audio/mpeg',
                        upsert: false
                    });

                    if (!uploadErr) {
                        const { data: publicUrlData } = supabase.storage.from('chat_audio').getPublicUrl(fileName);
                        if (publicUrlData?.publicUrl) {
                            finalOutput = `${finalAnswerText} [AUDIO:${publicUrlData.publicUrl}]`;
                        }
                    } else {
                        console.error('TTS Upload err:', uploadErr);
                    }
                }
            } catch (ttsErr) {
                console.error("ElevenLabs error:", ttsErr);
                // Fail silently for audio, still send text
            }
        }

        // 7. Save Answer
        await supabase.from('chat_messages').insert({ session_id, sender: 'ai', content: finalOutput });
        await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', session_id);

        return new Response(JSON.stringify({ success: true, user_text: user_message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    } catch (err) {
        console.error("Error handling chat:", err);
        return new Response(JSON.stringify({ error: err.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
    }
});

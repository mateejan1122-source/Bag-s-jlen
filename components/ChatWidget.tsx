import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Mic, Square, PlayCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Language, translations } from '../translations';

interface ChatWidgetProps {
  language: Language;
}

interface Message {
  id: string;
  sender: 'user' | 'admin' | 'ai';
  content: string;
  created_at: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ id: string, name: string, email: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioTranscribing, setIsAudioTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Inline booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({ date: '', time: '19:00', guests: 2 });
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('bagsojlen_chat_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        // Check if session still exists and is open
        supabase.from('chat_sessions').select('status').eq('id', parsed.id).single()
          .then(({ data, error }) => {
            if (!error && data && data.status === 'open') {
              setSessionInfo(parsed);
              loadMessages(parsed.id);
            } else {
              localStorage.removeItem('bagsojlen_chat_session');
            }
          });
      } catch (e) {
        // error parsing
      }
    }
  }, []);

  // Set up Realtime listener when session is active and widget is open
  useEffect(() => {
    if (!sessionInfo?.id || !isOpen) return;

    loadMessages(sessionInfo.id);

    const channel = supabase.channel(`chat_${sessionInfo.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionInfo.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => {
            if (!prev.find(m => m.id === newMsg.id)) {
              return [...prev, newMsg].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionInfo?.id, isOpen]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setMessages(data);
    }
  };

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) return;
    setIsRegistering(true);

    try {
      // Upsert user based on email. If session is closed, we need to create a new one or reopen.
      // Easiest is to always try to get the active one, or create new.
      
      let sessionId = null;
      
      // Check for any existing session for this email
      const { data: existingSessions, error: findErr } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('email', regEmail)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (!findErr && existingSessions && existingSessions.length > 0) {
        sessionId = existingSessions[0].id;
        // If it was closed, reopen it
        if (existingSessions[0].status !== 'open') {
          await supabase.from('chat_sessions').update({ status: 'open', name: regName }).eq('id', sessionId);
        }
      } else {
        // Create new session
        const { data: newSession, error: createErr } = await supabase
          .from('chat_sessions')
          .insert({ email: regEmail, name: regName, status: 'open' })
          .select()
          .single();
          
        if (createErr) throw createErr;
        sessionId = newSession.id;
        
        // Insert welcome message from system/admin
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          sender: 'admin',
          content: language === 'da' ? `Hej ${regName}! Hvordan kan vi hjælpe dig i dag?` : 
                   language === 'de' ? `Hallo ${regName}! Wie können wir Ihnen heute helfen?` :
                   `Hi ${regName}! How can we help you today?`
        });
      }

      if (sessionId) {
        const info = { id: sessionId, name: regName, email: regEmail };
        setSessionInfo(info);
        localStorage.setItem('bagsojlen_chat_session', JSON.stringify(info));
        loadMessages(sessionId);
      }
    } catch (err: any) {
      console.error("Failed to start chat", err);
      alert(language === 'da' ? "Kunne ikke starte chatten. Prøv venligst igen senere." : "Could not start chat. Please try again later.");
    } finally {
      setIsRegistering(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || !sessionInfo) return;

    const content = inputVal.trim();
    setInputVal('');

    try {
      // 1. Save user message to DB
      const { data: msgData, error: msgErr } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionInfo.id,
          sender: 'user',
          content: content
        })
        .select()
        .single();
        
      if (msgErr) throw msgErr;

      // 2. Optimistically add to UI
      setMessages(prev => [...prev, msgData]);

      // 3. Trigger edge function for AI response (Edge function will check if AI is enabled)
      supabase.functions.invoke('chat-handler', {
        body: { session_id: sessionInfo.id, user_message: content, language: language }
      }).catch(err => console.error("Edge function error:", err)); // fire and forget

    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  // Inline reservation form submit
  const handleBookingFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionInfo || !bookingForm.date || !bookingForm.time) return;
    setIsBookingSubmitting(true);
    try {
      const { error } = await supabase.from('bookings').insert([{
        date: bookingForm.date,
        time: bookingForm.time,
        guests: bookingForm.guests,
        fullName: sessionInfo.name,
        email: sessionInfo.email,
        phone: '',
        specialRequests: 'Booked via Chat Widget',
        status: 'confirmed'
      }]);
      if (error) throw error;

      // Add a confirmation message to the chat
      await supabase.from('chat_messages').insert({
        session_id: sessionInfo.id,
        sender: 'ai',
        content: language === 'da'
          ? `✅ Din reservation er indsendt! ${bookingForm.date} kl. ${bookingForm.time} for ${bookingForm.guests} gæster. Vi bekræfter snarest.`
          : `✅ Your reservation has been submitted! ${bookingForm.date} at ${bookingForm.time} for ${bookingForm.guests} guests. We will confirm shortly.`
      });

      setShowBookingForm(false);
      setBookingForm({ date: '', time: '19:00', guests: 2 });
    } catch (err) {
      console.error('Booking from chat failed:', err);
      alert('Failed to submit reservation. Please try again.');
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      setIsAudioTranscribing(true);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64AudioMessage = (reader.result as string).split(',')[1];
            
            // Send to edge function
            try {
              // We won't optimistically update text here since we don't know what user said yet,
              // or we can just show "Audio Message Transcribing..."
              const tempMsgId = `temp-${Date.now()}`;
              setMessages(prev => [...prev, {
                id: tempMsgId,
                sender: 'user',
                content: '[AUDIO_MESSAGE_UPLOADING]',
                created_at: new Date().toISOString()
              } as Message]);

              const { data, error } = await supabase.functions.invoke('chat-handler', {
                body: { session_id: sessionInfo?.id, audio_base64: base64AudioMessage, language: language }
              });

              if (!error && data?.user_text) {
                 // The edge function will handle saving the user_text and AI reply,
                 // the real-time listener will pull them in. We just remove the temp message.
                 setMessages(prev => prev.filter(m => m.id !== tempMsgId));
              } else {
                 setMessages(prev => prev.filter(m => m.id !== tempMsgId));
              }
            } catch (err) {
              console.error("Audio send error", err);
              setMessages(prev => prev.filter(m => !m.id.startsWith('temp')));
            } finally {
              setIsAudioTranscribing(false);
              // Stop all audio tracks
              stream.getTracks().forEach(track => track.stop());
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied or failed", err);
        alert("Microphone access is required to send voice messages.");
      }
    }
  };

  const renderMessageContent = (content: string) => {
    // Check if the content contains our secret [AUDIO:url] tag
    const audioMatch = content.match(/\[AUDIO:(.*?)\]/);
    if (audioMatch) {
      const audioUrl = audioMatch[1];
      const cleanText = content.replace(audioMatch[0], '').trim();
      return (
        <div className="flex flex-col gap-2">
          <span>{cleanText}</span>
          <audio controls src={audioUrl} className="h-8 max-w-[200px]" />
        </div>
      );
    }
    
    if (content === '[AUDIO_MESSAGE_UPLOADING]') {
        return <span className="italic opacity-50">Transcribing voice message...</span>;
    }

    return <span>{content}</span>;
  };

  const t_placeholder = language === 'da' ? 'Skriv en besked...' : language === 'de' ? 'Nachricht eingeben...' : 'Type a message...';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 bg-white border border-[#CDA235]/30 shadow-2xl w-[90vw] md:w-[350px] h-[500px] max-h-[80vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-[#1a1a1a] p-4 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-[#CDA235] font-bold text-sm tracking-widest uppercase">Live Chat</h3>
              <p className="text-gray-400 text-xs">Restaurant Bag Søjlen</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
            {!sessionInfo ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-16 h-16 bg-[#CDA235]/10 rounded-full flex items-center justify-center text-[#CDA235]">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h4 className="text-[#1a1a1a] font-bold text-lg">{language === 'da' ? 'Velkommen!' : 'Welcome!'}</h4>
                  <p className="text-gray-500 text-sm px-4 mt-2">
                    {language === 'da' 
                      ? 'Indtast venligst dit navn og e-mail for at starte chatten.' 
                      : 'Please enter your name and email to start chatting.'}
                  </p>
                </div>
                
                <form onSubmit={startChat} className="w-full space-y-4 px-2">
                  <input
                    type="text"
                    required
                    placeholder={language === 'da' ? 'Dit Navn' : 'Your Name'}
                    className="w-full text-sm border-b border-gray-300 py-2 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                  <input
                    type="email"
                    required
                    placeholder={language === 'da' ? 'Din E-mail' : 'Your Email'}
                    className="w-full text-sm border-b border-gray-300 py-2 focus:outline-none focus:border-[#CDA235] transition-colors bg-transparent"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full bg-[#CDA235] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 mt-4"
                  >
                    {isRegistering ? '...' : (language === 'da' ? 'Start Chat' : 'Start Chat')}
                  </button>
                </form>
              </div>
            ) : (
              // Message List
              <div className="space-y-4">
                {messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-end gap-2 max-w-[85%]">
                        {!isUser && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isAdmin ? 'bg-[#1a1a1a] text-white' : 'bg-[#CDA235] text-white'}`}>
                            {isAdmin ? <User size={12} /> : <div className="text-[10px] font-bold">AI</div>}
                          </div>
                        )}
                        <div className={`p-3 text-sm ${isUser ? 'bg-[#CDA235] text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                          {renderMessageContent(msg.content)}
                        </div>
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider mx-8">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                {/* Inline Booking Form */}
                {showBookingForm && (
                  <div className="bg-white border border-[#CDA235]/30 p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#CDA235]">Book a Table</span>
                      <button onClick={() => setShowBookingForm(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                    </div>
                    <form onSubmit={handleBookingFormSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">{language === 'da' ? 'Dato' : 'Date'}</label>
                          <input type="date" required value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} className="w-full text-sm border border-gray-200 px-2 py-1.5 focus:outline-none focus:border-[#CDA235]" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">{language === 'da' ? 'Tid' : 'Time'}</label>
                          <select value={bookingForm.time} onChange={e => setBookingForm({...bookingForm, time: e.target.value})} className="w-full text-sm border border-gray-200 px-2 py-1.5 focus:outline-none focus:border-[#CDA235] bg-white">
                            {['17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block mb-1">{language === 'da' ? 'Gæster' : 'Guests'}</label>
                        <div className="flex items-center gap-3 border border-gray-200 px-3 py-1.5">
                          <button type="button" onClick={() => setBookingForm({...bookingForm, guests: Math.max(1, bookingForm.guests - 1)})} className="text-lg hover:text-[#CDA235]">−</button>
                          <span className="text-sm font-bold flex-1 text-center">{bookingForm.guests}</span>
                          <button type="button" onClick={() => setBookingForm({...bookingForm, guests: bookingForm.guests + 1})} className="text-lg hover:text-[#CDA235]">+</button>
                        </div>
                      </div>
                      <button type="submit" disabled={!bookingForm.date || isBookingSubmitting} className="w-full bg-[#CDA235] text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-colors disabled:opacity-50">
                        {isBookingSubmitting ? '...' : (language === 'da' ? 'Send Reservation' : 'Submit Reservation')}
                      </button>
                    </form>
                  </div>
                )}

                {/* Quick Book Button — appears if no form is open and messages contain booking-related AI content */}
                {!showBookingForm && sessionInfo && messages.length > 0 && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowBookingForm(true)}
                      className="text-[10px] font-bold uppercase tracking-widest text-[#CDA235] border border-[#CDA235]/30 px-4 py-2 hover:bg-[#CDA235] hover:text-white transition-colors"
                    >
                      📅 {language === 'da' ? 'Book et bord' : 'Book a Table'}
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {sessionInfo && (
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder={t_placeholder}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#CDA235] text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isAudioTranscribing}
                  className={`px-3 flex items-center justify-center transition-colors disabled:opacity-50 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {isRecording ? <Square size={16} /> : <Mic size={16} />}
                </button>
                <button
                  type="submit"
                  disabled={!inputVal.trim() && !isRecording}
                  className="bg-[#1a1a1a] text-white px-4 flex items-center justify-center hover:bg-[#CDA235] transition-colors disabled:opacity-50 disabled:hover:bg-[#1a1a1a]"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#1a1a1a] hover:bg-[#CDA235] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105"
        style={{ boxShadow: '0 10px 25px -5px rgba(205, 162, 53, 0.4)' }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};

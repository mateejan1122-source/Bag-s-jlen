import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Bot, User, Send, CheckCircle, Search, ToggleLeft, ToggleRight } from 'lucide-react';

interface Session {
    id: string;
    email: string;
    name: string;
    status: string;
    created_at: string;
}

interface Message {
    id: string;
    sender: 'user' | 'admin' | 'ai';
    content: string;
    created_at: string;
}

export const ChatTab: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputVal, setInputVal] = useState('');
    const [aiEnabled, setAiEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        loadSessions();
        checkAiStatus();

        // Listen for new sessions becoming active
        const sessionSub = supabase.channel('chat_admin_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, () => {
                loadSessions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(sessionSub);
        };
    }, []);

    // Change Active Session Subscription
    useEffect(() => {
        if (!activeSession) return;
        loadMessages(activeSession.id);

        const msgSub = supabase.channel(`chat_admin_${activeSession.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${activeSession.id}` }, (payload) => {
                const newMsg = payload.new as Message;
                setMessages(prev => {
                    if (!prev.find(m => m.id === newMsg.id)) {
                        return [...prev, newMsg].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                    }
                    return prev;
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(msgSub);
        };
    }, [activeSession?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadSessions = async () => {
        const { data } = await supabase
            .from('chat_sessions')
            .select('*')
            .order('updated_at', { ascending: false });
        if (data) setSessions(data);
    };

    const loadMessages = async (sessionId: string) => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });
        if (data) setMessages(data);
    };

    const checkAiStatus = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'ai_chat_enabled').single();
        if (data) {
            setAiEnabled(data.value === 'true');
        }
    };

    const toggleAi = async () => {
        const newVal = !aiEnabled;
        setAiEnabled(newVal);
        await supabase.from('settings').upsert({ key: 'ai_chat_enabled', value: newVal ? 'true' : 'false', category: 'api' }, { onConflict: 'key' });
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim() || !activeSession) return;
        
        const content = inputVal;
        setInputVal('');

        await supabase.from('chat_messages').insert({
            session_id: activeSession.id,
            sender: 'admin',
            content: content
        });
        
        // Update session timestamp so it floats to top
        await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', activeSession.id);
    };

    const closeSession = async () => {
        if (!activeSession) return;
        if (!confirm('Are you sure you want to close this session and email the transcript?')) return;
        
        // Mark as closed
        await supabase.from('chat_sessions').update({ status: 'closed' }).eq('id', activeSession.id);
        
        alert("Session closed. Transcript is being sent.");
        
        // Fire edge function to send transcript
        supabase.functions.invoke('send-chat-transcript', {
            body: { session_id: activeSession.id }
        }).catch(err => console.error(err));

        setActiveSession(null);
        loadSessions();
    };

    const openSessions = sessions.filter(s => s.status === 'open');
    const closedSessions = sessions.filter(s => s.status === 'closed');

    return (
        <div className="animate-in fade-in duration-300 flex flex-col h-[calc(100vh-100px)]">
            <div className="flex justify-between items-end mb-8 border-b border-[#CDA235]/20 pb-8 shrink-0">
                <div>
                    <span className="text-[#CDA235] text-[11px] font-bold tracking-[0.5em] uppercase block mb-2">COMMUNICATION</span>
                    <h1 className="text-4xl md:text-5xl serif italic text-[#1a1a1a]">Live Chat</h1>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#1a1a1a]">AI Auto-Respond</span>
                        <span className="text-[10px] text-gray-500">When enabled, AI will reply if you are idle.</span>
                    </div>
                    <button onClick={toggleAi} className={`flex items-center justify-center transition-colors ${aiEnabled ? 'text-[#CDA235]' : 'text-gray-300'}`}>
                        {aiEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                    </button>
                </div>
            </div>

            <div className="flex bg-white shadow-[0_20px_40px_rgba(0,0,0,0.03)] border border-gray-100 flex-1 overflow-hidden min-h-[500px]">
                {/* Sidebar - Sessions List */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search conversations..."
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 focus:outline-[#CDA235] rounded-sm bg-white"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {openSessions.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[#CDA235]">Active ({openSessions.length})</span>
                            </div>
                        )}
                        {openSessions.map(s => (
                            <div key={s.id} 
                                onClick={() => setActiveSession(s)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${activeSession?.id === s.id ? 'bg-[#CDA235]/5 border-l-2 border-l-[#CDA235]' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-sm text-[#1a1a1a]">{s.name}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(s.updated_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate">{s.email}</div>
                            </div>
                        ))}

                        {closedSessions.length > 0 && (
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 border-t mt-4">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Closed ({closedSessions.length})</span>
                            </div>
                        )}
                        {closedSessions.map(s => (
                            <div key={s.id} 
                                onClick={() => setActiveSession(s)}
                                className={`p-4 border-b border-gray-50 cursor-pointer transition-colors opacity-60 ${activeSession?.id === s.id ? 'bg-gray-100 border-l-2 border-l-gray-400' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-sm text-[#1a1a1a]">{s.name}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(s.updated_at).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-gray-500 truncate">{s.email}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="w-2/3 flex flex-col bg-gray-50/30 relative">
                    {activeSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                                <div>
                                    <h3 className="font-bold text-[#1a1a1a]">{activeSession.name}</h3>
                                    <p className="text-xs text-gray-500">{activeSession.email}</p>
                                </div>
                                {activeSession.status === 'open' && (
                                    <button 
                                        onClick={closeSession}
                                        className="text-[10px] uppercase tracking-widest font-bold text-gray-500 hover:text-green-600 transition-colors flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded-sm"
                                    >
                                        <CheckCircle size={12} /> End Chat & Send Transcript
                                    </button>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.map((msg, idx) => {
                                    const isUser = msg.sender === 'user';
                                    const isAi = msg.sender === 'ai';
                                    return (
                                        <div key={msg.id || idx} className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}>
                                            <div className="flex items-end gap-3 max-w-[70%]">
                                                {isUser && (
                                                    <div className="w-8 h-8 rounded-full bg-[#CDA235] text-white flex items-center justify-center shrink-0">
                                                        <User size={14} />
                                                    </div>
                                                )}
                                                <div className={`p-4 text-sm shadow-sm ${isUser ? 'bg-white border text-[#1a1a1a]' : isAi ? 'bg-black text-white' : 'bg-[#CDA235] text-white'}`}>
                                                    {msg.content}
                                                </div>
                                                {!isUser && (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isAi ? 'bg-black text-white' : 'bg-[#CDA235] text-white'}`}>
                                                        {isAi ? <Bot size={14} /> : <div className="text-[10px] font-bold">ME</div>}
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[10px] text-gray-400 mt-2 uppercase tracking-wider ${isUser ? 'ml-11' : 'mr-11'} flex items-center gap-1`}>
                                                {msg.sender === 'ai' && <Bot size={10} className="text-[#CDA235]"/>} 
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            {activeSession.status === 'open' ? (
                                <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                                    <form onSubmit={sendMessage} className="flex gap-4">
                                        <input
                                            type="text"
                                            value={inputVal}
                                            onChange={e => setInputVal(e.target.value)}
                                            placeholder="Type a reply to the customer..."
                                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 focus:outline-[#CDA235] text-sm transition-colors rounded-sm"
                                        />
                                        <button
                                            disabled={!inputVal.trim()}
                                            type="submit"
                                            className="bg-[#1a1a1a] text-white px-8 flex items-center justify-center hover:bg-[#CDA235] transition-colors disabled:opacity-50 disabled:hover:bg-[#1a1a1a] rounded-sm text-[11px] font-bold tracking-widest uppercase gap-2"
                                        >
                                            <Send size={14} /> Send
                                        </button>
                                    </form>
                                    {aiEnabled && (
                                        <div className="mt-2 text-[10px] text-[#CDA235] flex justify-end">AI is currently active for this conversation.</div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-6 bg-gray-100 border-t border-gray-200 shrink-0 text-center text-gray-500 text-xs uppercase tracking-widest font-bold">
                                    This session has been closed.
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Bot size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Select a conversation from the sidebar to view messages.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

// --- Audio Helper Functions (Manual Implementation as per guidelines) ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export const VoiceAssistant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const toggleVoice = () => {
    if (isActive) {
      cleanup();
    } else {
      setIsActive(true);
      startSession();
    }
  };

  const cleanup = () => {
    setIsActive(false);
    setIsConnected(false);
    setIsModelSpeaking(false);
    
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();

    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
      audioContextsRef.current.input = null as any;
      audioContextsRef.current.output = null as any;
      audioContextsRef.current = null;
    }
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = scriptProcessor;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setIsModelSpeaking(true);
              const outputCtx = audioContextsRef.current?.output;
              if (outputCtx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputCtx.destination);
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
                });
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsModelSpeaking(false);
            }
          },
          onerror: (e) => {
            console.error('Voice Error:', e);
            cleanup();
          },
          onclose: () => cleanup(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Du er stemmen bag Restaurant Bag Søjlen i Rønde. Du er professionel, varm og hjælpsom. 
          Du kender til:
          - Menukortet: Sæsonmenu (248,-), Tilbudsmenu (168,-).
          - Historien: Over 30 år i Rønde, fokuseret på håndværk og kvalitet.
          - Faciliteter: Selskabslokaler, udsigt over Aarhus Bugten.
          - Booking: Du kan guide gæster gennem deres reservation.
          Svar primært på dansk. Vær kortfattet og elegant.`,
        },
      });

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then((session) => {
          if (isActive) session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start voice session:', err);
      cleanup();
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="fixed bottom-32 right-12 z-[100] flex flex-col items-end gap-6 no-print">
      {isActive && (
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-2xl p-6 rounded-2xl flex flex-col items-center gap-4 transition-all duration-500 animate-in fade-in slide-in-from-bottom-10">
          <div className="flex gap-1.5 h-8 items-center">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 bg-[#CDA235] rounded-full transition-all duration-300 ${
                  isModelSpeaking ? 'animate-bounce' : isConnected ? 'animate-pulse' : 'h-1 opacity-20'
                }`}
                style={{ 
                  height: isModelSpeaking ? `${20 + Math.random() * 60}%` : isConnected ? '40%' : '10%',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#CDA235]">
            {!isConnected ? 'Forbinder...' : isModelSpeaking ? 'Bag Søjlen taler' : 'Jeg lytter...'}
          </span>
        </div>
      )}

      <button
        onClick={toggleVoice}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl group ${
          isActive ? 'bg-[#1a1a1a] scale-110 rotate-90' : 'bg-white hover:bg-[#FAF9F6] border border-gray-100'
        }`}
      >
        <div className={`relative flex items-center justify-center ${isActive ? 'text-[#CDA235]' : 'text-gray-400'}`}>
           {isActive ? (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
           ) : (
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:text-[#CDA235] transition-colors">
               <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
               <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
               <line x1="12" y1="19" x2="12" y2="23"></line>
               <line x1="8" y1="23" x2="16" y2="23"></line>
             </svg>
           )}
           {isActive && <div className="absolute inset-0 rounded-full border-4 border-[#CDA235]/30 animate-ping"></div>}
        </div>
      </button>
      
      {!isActive && (
        <span className="absolute -top-12 right-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400 bg-white/50 px-4 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Tal med os
        </span>
      )}
    </div>
  );
};

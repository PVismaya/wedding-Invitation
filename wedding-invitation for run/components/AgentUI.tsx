
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { decode, decodeAudioData, createBlob } from '../utils/audio';
import { WeddingData, Language } from '../types';

interface AgentUIProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  weddingData: WeddingData;
}

const AgentUI: React.FC<AgentUIProps> = ({ isOpen, onClose, language, weddingData }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [pulse, setPulse] = useState(1);
  const [history, setHistory] = useState<{ text: string; role: 'user' | 'model' }[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const sessionRef = useRef<any>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const historyEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isMutedRef = useRef(isMuted);
  const isModelSpeakingRef = useRef(isModelSpeaking);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isModelSpeakingRef.current = isModelSpeaking;
  }, [isModelSpeaking]);

  const displayDateLong = (() => {
    const d = new Date(weddingData.date);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  const systemInstruction = `You are the Ethereal Wedding Concierge for ${weddingData.groomName} and ${weddingData.brideName}.
Wedding Date: ${displayDateLong}.
Venue: ${weddingData.venueName}, ${weddingData.venueAddress}.
Language: Speak fluently in ${language}.
Tone: Warm, celebratory, and helpful.
If asked for directions, use Google Maps tool. Answer questions about the schedule and the couple's story: ${weddingData.story}`;

  const stopAudio = useCallback(() => {
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsModelSpeaking(false);
  }, []);

  const cleanup = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    
    if (inputCtxRef.current && inputCtxRef.current.state !== 'closed') {
      inputCtxRef.current.close().catch(() => {});
    }
    inputCtxRef.current = null;

    if (outputCtxRef.current && outputCtxRef.current.state !== 'closed') {
      outputCtxRef.current.close().catch(() => {});
    }
    outputCtxRef.current = null;

    stopAudio();
    setStatus('idle');
  }, [stopAudio]);

  const startConnection = async () => {
    // Check for API Key first
    const apiKey = (process.env as any).API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE" || apiKey === "") {
      setStatus('error');
      setErrorMessage("API Key is missing. Check your .env file.");
      console.error("Agent Error: API Key is invalid or not configured.");
      return;
    }

    if (status !== 'idle') return;
    setStatus('connecting');
    setErrorMessage(null);
    setHistory([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await inCtx.resume();
      await outCtx.resume();
      inputCtxRef.current = inCtx;
      outputCtxRef.current = outCtx;

      const ai = new GoogleGenAI({ apiKey });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            const source = inCtx.createMediaStreamSource(stream);
            const processor = inCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              if (isMutedRef.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(err => {
                console.error("Session Send Error:", err);
              });

              if (!isModelSpeakingRef.current) {
                const vol = Math.sqrt(inputData.reduce((acc, v) => acc + v * v, 0) / inputData.length);
                setPulse(1 + vol * 3);
              }
            };

            source.connect(processor);
            processor.connect(inCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.interrupted) {
              stopAudio();
              return;
            }

            const base64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64) {
              setIsModelSpeaking(true);
              try {
                const buffer = await decodeAudioData(decode(base64), outCtx, 24000, 1);
                const source = outCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outCtx.destination);
                
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                
                sourcesRef.current.add(source);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsModelSpeaking(false);
                };
              } catch (e) {
                console.error("Audio Decode Error:", e);
              }
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setHistory(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                return [...prev, { text, role: 'model' }];
              });
            } else if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              setHistory(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                return [...prev, { text, role: 'user' }];
              });
            }
          },
          onerror: (e) => { 
            console.error("Live API Error:", e); 
            setStatus('error');
            setErrorMessage("Connection failed. Check your network or API key.");
          },
          onclose: () => cleanup()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ googleMaps: {} }],
          systemInstruction,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error("Connection Init Error:", err);
      setStatus('error');
      setErrorMessage(err.message || "Could not start microphone session.");
    }
  };

  const toggleSession = () => {
    if (status === 'active') cleanup();
    else startConnection();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-0 bg-indigo-950/20 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white/30 backdrop-blur-2xl rounded-t-[4rem] p-8 flex flex-col items-center gap-6 shadow-2xl h-[94vh] animate-slide-up relative border-x border-t border-white/50">
        <div className="w-12 h-1 bg-indigo-900/10 rounded-full shrink-0 mb-2"></div>
        <button onClick={() => { cleanup(); onClose(); }} className="absolute top-8 right-8 p-3 text-indigo-900/40 bg-white/20 rounded-full active:scale-90 transition-all border border-white/40">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-2 mt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 border border-white/40 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-black uppercase text-indigo-800 tracking-widest">Ethereal Brain</span>
          </div>
          <h3 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter playfair">Concierge</h3>
        </div>

        {status === 'error' && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-700 uppercase tracking-tight leading-tight">{errorMessage}</p>
          </div>
        )}

        <div className="relative flex items-center justify-center py-8 w-full">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(status === 'active' ? 3 : 0)].map((_, i) => (
              <div 
                key={i}
                style={{ 
                  transform: `scale(${pulse * (1 + i * 0.4)})`,
                  opacity: (isModelSpeaking ? 0.25 : 0.1) / (i + 1),
                  transition: 'transform 0.1s ease-out',
                }}
                className="absolute w-40 h-40 border-2 rounded-full border-indigo-600/30 shadow-lg"
              />
            ))}
          </div>
          
          <div className={`w-36 h-36 rounded-full flex items-center justify-center shadow-xl z-10 transition-all duration-700 backdrop-blur-3xl border border-white/60 ${
            status === 'active' 
            ? isModelSpeaking ? 'bg-indigo-600/20 scale-105' : 'bg-sky-500/10 scale-100'
            : 'bg-white/10'
          }`}>
            {status === 'connecting' ? (
              <Loader2 className="w-10 h-10 text-indigo-600/60 animate-spin" />
            ) : status === 'active' ? (
              <div className="flex gap-1.5 items-center">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-indigo-600/60 rounded-full animate-wave" style={{ 
                    height: `${isModelSpeaking ? 20 + Math.random() * 40 : 10 + Math.random() * 20}px`,
                    animationDelay: `${i * 0.1}s`
                  }} />
                ))}
              </div>
            ) : (
              <Mic className="w-10 h-10 text-indigo-950/20" />
            )}
          </div>
        </div>

        <div className="flex-1 w-full overflow-y-auto px-4 space-y-6 no-scrollbar border-y border-white/10 py-8 scroll-smooth mask-fade-edges">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 space-y-4">
              <p className="text-[10px] font-black uppercase text-indigo-900 tracking-widest leading-loose px-10">
                I am here to guide you through the wedding of {weddingData.groomName} & {weddingData.brideName}
              </p>
            </div>
          ) : (
            history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-[2.5rem] text-sm font-medium shadow-sm backdrop-blur-xl border ${
                  msg.role === 'user' 
                  ? 'bg-indigo-600/30 text-indigo-950 rounded-br-none border-white/40' 
                  : 'bg-white/40 text-indigo-950 rounded-bl-none border-white/60'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={historyEndRef} />
        </div>

        <div className="w-full flex items-center gap-4 pt-4 pb-10">
          <button 
            onClick={toggleSession} 
            disabled={status === 'connecting'} 
            className={`flex-1 py-6 rounded-3xl font-black uppercase tracking-[0.25em] shadow-xl active:scale-[0.98] transition-all text-[10px] flex items-center justify-center gap-3 backdrop-blur-xl border ${
              status === 'active' 
              ? 'bg-indigo-950 text-white' 
              : 'bg-white/40 text-indigo-950'
            }`}
          >
            {status === 'connecting' ? 'Initiating...' : status === 'active' ? 'End Conversation' : 'Start Consultation'}
          </button>
          
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className={`p-6 rounded-3xl shadow-lg border backdrop-blur-3xl transition-all active:scale-90 ${
              isMuted 
              ? 'bg-red-500/10 text-red-600 border-red-200/40' 
              : 'bg-white/30 text-indigo-600 border-white/60'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes wave { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.5); } }
        .animate-wave { animation: wave 0.8s ease-in-out infinite; }
        .mask-fade-edges { mask-image: linear-gradient(to bottom, transparent, black 15%, black 85%, transparent); }
      `}</style>
    </div>
  );
};

export default AgentUI;

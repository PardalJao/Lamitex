
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { sendMessageToAgent } from '../services/geminiService';

const NATH_PHOTO = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100";

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Media State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaAttachment, setMediaAttachment] = useState<{type: 'image'|'audio', data: string, mimeType: string} | null>(null);
  const [lockControls, setLockControls] = useState(false); // New lock to prevent loop
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Recording Timer logic
  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  // --- Helpers ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Bom dia";
    if (hour >= 12 && hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getTimeString = () => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Handlers ---
  const handleSend = async () => {
    if ((!input.trim() && !mediaAttachment) || isLoading || lockControls) return;

    setLockControls(true); // Lock to prevent accidental double clicks/loops
    
    const currentText = input;
    const currentAttachment = mediaAttachment;
    const isFirstMessage = messages.length === 0;

    // Reset everything immediately to stop loops
    setInput('');
    setMediaAttachment(null);
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: currentText,
      attachment: currentAttachment ? { ...currentAttachment } : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const context = isFirstMessage 
        ? `[Contexto: O cliente acaba de chegar via anúncio. Agradeça o contato de forma entusiasmada e comece a qualificação: peça o nome dele e o que ele busca.] `
        : "";

      const responseText = await sendMessageToAgent(`${context}${currentText}`, currentAttachment || undefined);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
      setLockControls(false); // Unlock
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaAttachment({
          type: 'image',
          data: event.target?.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const startRecording = async () => {
    if (isRecording || lockControls) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaAttachment({ type: 'audio', data: reader.result as string, mimeType: 'audio/webm' });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microfone bloqueado ou indisponível.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Brief lockdown to prevent immediate restart loop
      setLockControls(true);
      setTimeout(() => setLockControls(false), 300);
    }
  };

  const removeAttachment = () => {
    setMediaAttachment(null);
    setLockControls(true);
    setTimeout(() => setLockControls(false), 300);
  };

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

      {/* Chat Area - Using calc for mobile heights */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-0 custom-scrollbar relative">
        <div className="flex justify-center mb-2">
          <div className="bg-[#D9F0FF] text-[#0047AB] text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-sm border border-blue-100/50">HOJE</div>
        </div>

        {messages.length === 0 && (
          <div className="flex justify-center mt-2">
            <div className="bg-[#FCF4CB] text-[#554E3C] text-[10px] px-5 py-3 rounded-2xl shadow-sm border border-[#E1D9B1] text-center max-w-[280px] leading-relaxed font-medium">
              🔒 <b>Segurança Lamitex:</b> Suas mensagens são privadas. A Nath está pronta para te atender com agilidade industrial.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-[88%] px-3 py-2 rounded-2xl shadow-sm text-[13px] lg:text-[13.5px] leading-snug ${msg.role === 'user' ? 'bg-[#DCF8C6] text-[#303030] rounded-tr-none ml-8' : 'bg-white text-[#303030] rounded-tl-none mr-8'}`}>
              <div className={`absolute top-0 w-3 h-3 ${msg.role === 'user' ? '-right-2 bg-[#DCF8C6]' : '-left-2 bg-white'}`} style={{ clipPath: msg.role === 'user' ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
              
              {msg.attachment && (
                <div className="mb-2 -mx-1 -mt-1">
                  {msg.attachment.type === 'image' ? (
                    <img src={msg.attachment.data} className="rounded-t-xl max-h-72 w-full object-cover" alt="Foto" />
                  ) : (
                    <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-[220px]">
                      <div className="w-9 h-9 rounded-full bg-[#075E54] flex items-center justify-center text-white cursor-pointer hover:bg-[#054d44] shrink-0">▶️</div>
                      <div className="flex-1 flex flex-col space-y-1">
                        <div className="h-1 bg-slate-200 rounded overflow-hidden">
                          <div className="h-full w-2/3 bg-[#075E54] opacity-40"></div>
                        </div>
                        <div className="flex justify-between text-[8px] text-slate-400 font-black">
                          <span>0:15</span>
                          <span>ÁUDIO</span>
                        </div>
                      </div>
                      <div className="relative shrink-0">
                        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=32&h=32" className="w-7 h-7 rounded-full border border-white" alt="avatar" />
                        <span className="absolute -bottom-1 -right-1 text-[8px]">🎤</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="whitespace-pre-line pb-4 pt-1 font-semibold text-slate-700">{msg.text}</div>
              <div className="text-[8px] text-slate-400 text-right absolute bottom-1.5 right-2 flex items-center space-x-1 uppercase font-black">
                <span>{getTimeString()}</span>
                {msg.role === 'user' && <span className="text-blue-400">✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="bg-white/90 px-4 py-2 rounded-2xl shadow-sm text-[10px] font-black text-slate-400 animate-pulse tracking-widest uppercase">Digitando...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Area */}
      {mediaAttachment && (
        <div className="bg-white/95 backdrop-blur-md p-3 border-t border-slate-200 flex items-center justify-between z-20 shadow-2xl animate-in slide-in-from-bottom-2 duration-300 mx-2 mb-2 rounded-2xl border border-slate-200/50">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center shadow-inner">
              {mediaAttachment.type === 'image' ? <img src={mediaAttachment.data} className="w-full h-full object-cover" alt="Preview" /> : <span className="text-xl">🎙️</span>}
            </div>
            <div>
              <p className="text-[10px] font-black text-[#075E54] tracking-tighter">PRONTO PARA ENVIAR</p>
              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{mediaAttachment.type}</p>
            </div>
          </div>
          <button onClick={removeAttachment} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-all active:scale-90">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-2 lg:p-3 bg-[#F0F0F0] flex items-end space-x-2 z-10 border-t border-slate-200 shrink-0">
        <div className={`flex-1 bg-white rounded-3xl flex items-end px-3 py-1 lg:py-1.5 shadow-sm border border-slate-200 transition-all ${isRecording ? 'bg-red-50 border-red-200 ring-2 ring-red-500/20' : 'hover:border-slate-300'}`}>
          {!isRecording && (
            <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#075E54] transition-all" title="Anexar">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-1.5z"/></svg>
            </button>
          )}

          {isRecording ? (
            <div className="flex-1 flex items-center px-4 py-2.5 space-x-4">
              <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
              <span className="text-red-700 font-black text-sm tabular-nums">{formatDuration(recordingDuration)}</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Gravando...</span>
            </div>
          ) : (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mensagem..."
              className="flex-1 border-none bg-transparent px-2 py-2 focus:outline-none text-[15px] resize-none max-h-32 text-slate-800 leading-tight placeholder-slate-400 font-semibold"
              rows={1}
              onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
          )}

          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
          
          {!isRecording && (
            <button className="p-2 text-slate-400 hover:text-[#075E54] transition-all" onClick={() => fileInputRef.current?.click()} title="Foto">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
            </button>
          )}
        </div>

        {/* Send or Mic */}
        {input.trim() || mediaAttachment ? (
          <button 
            onClick={handleSend} 
            disabled={lockControls}
            className={`w-12 h-12 bg-[#075E54] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 hover:bg-[#054d44] transition-all flex-shrink-0 ${lockControls ? 'opacity-50' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="ml-1"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/></svg>
          </button>
        ) : (
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            disabled={lockControls}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all flex-shrink-0 ${isRecording ? 'bg-red-600 scale-110' : 'bg-[#075E54] hover:bg-[#054d44]'} ${lockControls ? 'opacity-50' : ''}`}
          >
            {isRecording ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

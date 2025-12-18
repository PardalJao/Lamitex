import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { sendMessageToAgent } from '../services/geminiService';

const NATH_PHOTO = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100";

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mediaAttachment, setMediaAttachment] = useState<{type: 'image'|'audio', data: string, mimeType: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!input.trim() && !mediaAttachment) || isLoading) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: input, 
      attachment: mediaAttachment || undefined 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setMediaAttachment(null);
    setIsLoading(true);

    try {
      const response = await sendMessageToAgent(input, mediaAttachment || undefined);
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeString = () => {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] relative rounded-2xl overflow-hidden shadow-inner">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 z-0 custom-scrollbar relative">
        {messages.length === 0 && (
          <div className="flex justify-center mt-10">
            <div className="bg-[#FCF4CB] text-[#554E3C] text-sm px-6 py-4 rounded-xl shadow-sm border border-[#E1D9B1] text-center max-w-[320px] font-bold">
              🔒 Suas mensagens são privadas. A Nath está pronta para te atender.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`relative max-w-[85%] px-4 py-2.5 rounded-xl shadow-sm text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-[#DCF8C6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
              {msg.attachment?.type === 'image' && (
                <img src={msg.attachment.data} className="rounded-lg mb-2 max-h-60 w-full object-cover" alt="Anexo" />
              )}
              <div className="whitespace-pre-line pb-4 font-medium">{msg.text}</div>
              <div className="text-[10px] text-slate-400 text-right absolute bottom-1 right-2 flex items-center space-x-1 uppercase font-bold">
                <span>{getTimeString()}</span>
                {msg.role === 'user' && <span className="text-blue-500">✓✓</span>}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/95 px-4 py-2 rounded-xl shadow-sm text-xs font-bold text-slate-400 animate-pulse tracking-widest uppercase">
              Nath digitando...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#F0F0F0] flex items-end space-x-3 z-10 border-t border-slate-200">
        <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-sm">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-1.5z"/></svg>
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setMediaAttachment({ type: 'image', data: ev.target?.result as string, mimeType: file.type });
                reader.readAsDataURL(file);
              }
            }} 
          />

          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua mensagem aqui..."
            className="flex-1 border-none bg-transparent px-3 py-2 focus:outline-none text-base font-medium text-slate-800"
          />
        </div>

        <button 
          onClick={handleSend}
          disabled={(!input.trim() && !mediaAttachment) || isLoading}
          className="w-12 h-12 bg-[#075E54] rounded-full flex items-center justify-center text-white shadow-md active:scale-95 hover:bg-[#054d44] transition-all disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="ml-1"><path d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
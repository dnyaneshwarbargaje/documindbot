
import React, { useRef, useEffect, useState } from 'react';
import { Send, BrainCircuit, AlertCircle, Sparkles, Database, Search, Terminal } from 'lucide-react';
import { Message } from '../types';
import MessageItem from './MessageItem';

interface ChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isTyping, error, onSendMessage }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  const CHIPS = [
    { label: "Executive Synthesis", icon: Database },
    { label: "Semantic Deep Dive", icon: Search },
    { label: "Technical Verification", icon: Terminal }
  ];

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-12 space-y-16 scrollbar-hide">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-6 animate-in fade-in duration-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-indigo-500 animate-pulse" />
            </div>
            <div className="flex flex-col gap-3 mt-1.5">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Retrieving Fragments</span>
              <div className="p-5 bg-slate-900 border border-white/5 rounded-3xl rounded-tl-sm w-20 flex justify-center shadow-2xl">
                 <div className="flex gap-2">
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-5 p-6 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-3xl max-w-2xl mx-auto shadow-2xl backdrop-blur-md">
            <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
            <p className="text-sm font-black leading-tight">{error}</p>
          </div>
        )}
      </div>

      <div className="p-10 bg-[#020617] border-t border-white/5 relative z-20">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* RAG Quick Commands */}
          <div className="flex flex-wrap gap-3 justify-center">
            {CHIPS.map((chip, i) => (
              <button
                key={i}
                onClick={() => onSendMessage(chip.label)}
                className="flex items-center gap-3 px-6 py-3 bg-slate-900/50 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all shadow-lg active:scale-95"
              >
                <chip.icon className="w-4 h-4" />
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute -inset-1 bg-indigo-600/10 rounded-[2.5rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              placeholder="Submit research query to RAG interface..."
              className="relative w-full py-7 pl-10 pr-24 bg-slate-900/40 border-2 border-white/5 rounded-[2.5rem] focus:border-indigo-600 outline-none transition-all placeholder:text-slate-700 text-slate-100 shadow-3xl text-lg font-semibold tracking-tight"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`
                absolute right-4 top-1/2 -translate-y-1/2 p-5 rounded-[1.8rem] transition-all
                ${!input.trim() || isTyping 
                  ? 'text-slate-800' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xl shadow-indigo-600/30 active:scale-90'}
              `}
            >
              <Send className="w-7 h-7" />
            </button>
          </form>
          <div className="flex justify-center items-center gap-6 opacity-20">
             <div className="h-px w-12 bg-slate-800"></div>
             <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.8em]">Knowledge Synthesis Active</p>
             <div className="h-px w-12 bg-slate-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

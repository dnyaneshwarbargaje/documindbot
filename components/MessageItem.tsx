
import React from 'react';
import { User, BrainCircuit, Clock } from 'lucide-react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-8 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
      <div className={`
        flex-shrink-0 w-14 h-14 rounded-[1.8rem] flex items-center justify-center border-2 transition-all duration-500
        ${isUser 
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-600/20' 
          : 'bg-slate-900 border-white/10 text-indigo-400 shadow-2xl shadow-black/40'}
      `}>
        {isUser ? <User className="w-7 h-7" /> : <BrainCircuit className="w-7 h-7" />}
      </div>

      <div className={`flex flex-col gap-3.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-4 px-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            {isUser ? 'Client Node' : 'DocMind Kernel'}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-700 font-black uppercase tracking-tight">
            <Clock className="w-3.5 h-3.5" />
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        <div className={`
          p-8 text-[17px] leading-[1.8] font-medium tracking-tight shadow-3xl transition-all duration-300
          ${isUser 
            ? 'bg-indigo-600 text-white rounded-[2.5rem] rounded-tr-none' 
            : 'bg-slate-900/80 border border-white/5 text-slate-100 rounded-[2.5rem] rounded-tl-none'}
        `}>
          <div className="whitespace-pre-wrap">
            {message.text}
          </div>
        </div>
        
        {!isUser && (
           <div className="flex gap-3 mt-2 px-2">
              <div className="px-3 py-1 bg-slate-900/80 border border-white/10 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                Source Verified
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

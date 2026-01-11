
import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen,
  BrainCircuit,
  Activity
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { Document, Message } from './types';
import { getAssistantStreamingResponse } from './services/geminiService';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `DocMind Workspace Online. My internal RAG logic is ready to process your documents. Upload your data to begin semantic indexing.`,
        timestamp: Date.now(),
      }
    ]);
  }, []);

  const handleUploadDocument = (newDoc: Document) => {
    setDocuments(prev => [...prev, newDoc]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleWorkspaceAction = async (action: 'summarize' | 'insights' | 'conflicts') => {
    const prompts = {
      summarize: "Synthesize all indexed data and provide a unified technical summary.",
      insights: "Run a semantic analysis to discover correlations across the current document index.",
      conflicts: "Audit all documents for potential logical inconsistencies or contradictory data points."
    };
    handleSendMessage(prompts[action]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    const assistantMsgId = (Date.now() + 1).toString();
    let assistantText = "";

    try {
      const stream = getAssistantStreamingResponse(text, messages, documents);
      
      for await (const chunk of stream) {
        assistantText += chunk;
        setMessages(prev => {
          const others = prev.filter(m => m.id !== assistantMsgId);
          return [...others, {
            id: assistantMsgId,
            role: 'assistant',
            text: assistantText,
            timestamp: Date.now(),
          }];
        });
      }
    } catch (err: any) {
      setError("RAG Retrieval Failed. The indexing service might be overloaded.");
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative text-slate-100 bg-[#020617]">
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-8 left-8 z-50 lg:hidden p-5 bg-indigo-600 text-white rounded-3xl shadow-2xl hover:bg-indigo-500 transition-all border border-indigo-400/20"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      <div className={`
        fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          documents={documents} 
          onUpload={handleUploadDocument} 
          onRemove={handleRemoveDocument} 
          onClose={() => setIsSidebarOpen(false)}
          onWorkspaceAction={handleWorkspaceAction}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-[#020617] relative z-10">
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 text-slate-500 hover:text-indigo-400 hover:bg-white/5 rounded-2xl hidden lg:block transition-all border border-transparent hover:border-white/5"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/10 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h1 className="font-black text-2xl text-slate-100 tracking-tighter">
                Doc<span className="text-indigo-400">Mind</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="hidden md:flex items-center gap-6 border-l border-white/10 pl-8">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Retrieval Health</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000" 
                        style={{ width: `${Math.min(documents.length * 20, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <Activity className={`w-5 h-5 ${isTyping ? 'text-indigo-400 animate-pulse' : 'text-slate-700'}`} />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <ChatArea 
            messages={messages} 
            isTyping={isTyping} 
            error={error}
            onSendMessage={handleSendMessage} 
          />
        </main>
      </div>
    </div>
  );
};

export default App;

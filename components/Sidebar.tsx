
import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Trash2, 
  X, 
  Database, 
  FileUp, 
  Zap, 
  ShieldCheck,
  Library,
  Loader2,
  Cpu,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { Document } from '../types';

interface SidebarProps {
  documents: Document[];
  onUpload: (doc: Document) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
  onWorkspaceAction: (action: 'summarize' | 'insights' | 'conflicts') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ documents, onUpload, onRemove, onClose, onWorkspaceAction }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    try {
      for (const file of files) {
        const content = await file.text();
        onUpload({
          id: Math.random().toString(36).substring(7),
          name: file.name,
          content: content,
          type: file.type || 'text/plain',
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error("Indexing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <aside className="h-full flex flex-col bg-[#020617] border-r border-white/5 relative z-20">
      <div className="p-8 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Library className="w-5 h-5 text-indigo-500" />
          <h2 className="font-black text-[11px] uppercase tracking-[0.3em] text-slate-500">Document Store</h2>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10 scrollbar-hide">
        {/* RAG Status Hud */}
        <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center justify-between mb-6">
             <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Workspace Index</div>
             <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${documents.length > 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-600'}`}>
                {documents.length > 0 ? 'Live' : 'Empty'}
             </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{documents.length}</span>
            <span className="text-xs font-bold text-slate-500">Indices</span>
          </div>
        </div>

        {/* Analytic Chips */}
        <div>
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4 px-2">Core Logic</p>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { id: 'summarize', label: 'Semantic Synthesis', icon: Database, color: 'text-indigo-400' },
              { id: 'insights', label: 'Pattern Detection', icon: Cpu, color: 'text-violet-400' },
              { id: 'conflicts', label: 'Logic Audit', icon: ShieldCheck, color: 'text-blue-400' }
            ].map(action => (
              <button 
                key={action.id}
                onClick={() => onWorkspaceAction(action.id as any)}
                className="group flex items-center justify-between w-full p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-slate-950/80 ${action.color} border border-white/5`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">{action.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-800 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Data Ingestion */}
        <div>
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(Array.from(e.dataTransfer.files)); }}
            className={`
              border-2 border-dashed rounded-[2.5rem] p-10 text-center transition-all duration-300
              ${isDragging ? 'border-indigo-500 bg-indigo-500/5 scale-[1.02]' : 'border-slate-800 bg-slate-900/20 hover:border-slate-700'}
            `}
          >
            <input type="file" ref={fileInputRef} onChange={(e) => processFiles(Array.from(e.target.files || []))} className="hidden" multiple />
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
              {isProcessing ? <Loader2 className="w-7 h-7 text-white animate-spin" /> : <FileUp className="w-7 h-7 text-white" />}
            </div>
            <p className="text-sm font-black text-slate-100 mb-2">Ingest Data</p>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-6">RAG Ready</p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
            >
              Browse Indices
            </button>
          </div>
        </div>

        {/* Indexed Docs */}
        <div>
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-4 px-2">Knowledge Vault</p>
          <div className="space-y-2">
            {documents.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-900 rounded-3xl">
                <HardDrive className="w-6 h-6 text-slate-900 mx-auto mb-2" />
                <p className="text-[10px] text-slate-800 font-black uppercase">Warehouse Empty</p>
              </div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="group flex items-center justify-between p-4 bg-slate-900/30 border border-white/5 rounded-2xl hover:bg-slate-800/50 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2.5 rounded-xl bg-slate-950/80 text-indigo-400 border border-white/5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-black text-slate-300 truncate">{doc.name}</span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">Indexed Segment</span>
                    </div>
                  </div>
                  <button onClick={() => onRemove(doc.id)} className="p-2 text-slate-800 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="p-8 bg-[#020617] border-t border-white/5">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-xl">
              <Zap className="w-6 h-6 text-indigo-500" />
           </div>
           <div>
              <p className="text-sm font-black text-slate-100 tracking-tight">DocMind v2.8</p>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pro RAG License</p>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

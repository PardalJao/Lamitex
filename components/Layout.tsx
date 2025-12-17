
import React, { useState } from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
}

const NATH_PHOTO = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100";

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems: { id: ViewState; label: string; icon: string | React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard Store', icon: '📊' },
    { id: 'kanban', label: 'Pipeline de Vendas', icon: '🏭' },
    { id: 'prospecting', label: 'Prospecção Maps', icon: '🗺️' },
    { 
      id: 'chat', 
      label: 'Consultora Nath', 
      icon: <div className="relative">
        <img src={NATH_PHOTO} className="w-6 h-6 rounded-full object-cover border border-white/20" alt="Nath" />
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-slate-900"></div>
      </div> 
    },
  ];

  const handleSetView = (view: ViewState) => {
    setView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-40 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              LAMITEX <span className="text-lamitex-blue text-xs align-top">OS</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-bold">Sales Intelligence</p>
          </div>
          <button className="lg:hidden text-slate-400 p-1" onClick={() => setIsSidebarOpen(false)}>
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSetView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-lamitex-blue text-white shadow-lg shadow-blue-900/40 translate-x-1'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="w-6 h-6 flex items-center justify-center text-xl">
                {item.icon}
              </div>
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-2xl p-3 flex items-center space-x-3 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-lamitex-blue flex items-center justify-center text-[10px] text-white font-black shadow-inner">
              LA
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-white font-bold truncate">Equipe Lamitex</p>
              <p className="text-[9px] text-green-400 flex items-center font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                HUB ONLINE
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
             <button 
               className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
               onClick={() => setIsSidebarOpen(true)}
             >
               <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
             </button>
             <div className="h-8 w-px bg-slate-200 lg:hidden"></div>
             {currentView === 'chat' && (
               <img src={NATH_PHOTO} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="Nath" />
             )}
             <h2 className="text-base lg:text-lg font-black text-slate-800 tracking-tight">
              {menuItems.find(m => m.id === currentView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Build</span>
                <span className="text-[11px] text-slate-600 font-bold">1.4.0 (Nath Mobile)</span>
             </div>
             <button className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

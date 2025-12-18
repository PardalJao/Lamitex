import React, { useState } from 'react';
import { Lead } from '../types';

interface KanbanBoardProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const COLUMNS: { id: Lead['status']; label: string; color: string }[] = [
  { id: 'prospecting', label: 'Prospecção / Maps', color: 'border-slate-400' },
  { id: 'triage', label: 'Triagem Técnica', color: 'border-blue-500' },
  { id: 'sample_sent', label: 'Amostra Enviada', color: 'border-yellow-500' },
  { id: 'quote', label: 'Orçamento', color: 'border-orange-500' },
  { id: 'production', label: 'Produção / Corte', color: 'border-purple-500' },
  { id: 'shipping', label: 'Expedição', color: 'border-green-600' },
];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, setLeads }) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    setLeads(prev => prev.map(lead => {
      if (lead.id === draggedLeadId) {
        return { ...lead, status: targetStatus };
      }
      return lead;
    }));
    
    setDraggedLeadId(null);
  };

  const getColumnTotal = (status: Lead['status']) => {
    return leads
      .filter(l => l.status === status)
      .reduce((sum, item) => sum + (item.value || 0), 0);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6 h-full items-start px-4">
      {COLUMNS.map(col => {
        const columnLeads = leads.filter(l => l.status === col.id);
        const totalValue = getColumnTotal(col.id);

        return (
          <div 
            key={col.id} 
            className={`min-w-[340px] bg-slate-100/50 rounded-2xl flex flex-col h-full border-t-[8px] shadow-sm transition-all duration-200 ${draggedLeadId ? 'bg-slate-200/50 scale-[0.99]' : ''}`}
            style={{borderColor: col.color.replace('border-', '')}}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="p-5 bg-white rounded-t-xl border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-widest">{col.label}</h3>
                <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black">
                  {columnLeads.length}
                </span>
              </div>
              <div className="flex flex-col bg-slate-50 p-3 rounded-xl border border-slate-100">
                 <span className="text-[11px] text-slate-400 font-black uppercase tracking-tighter mb-0.5">Valor Acumulado</span>
                 <span className="text-lg font-black text-lamitex-blue">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar min-h-[200px]">
              {columnLeads.map(lead => (
                <div 
                  key={lead.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-lamitex-blue hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex justify-between items-start mb-3 pointer-events-none">
                    <h4 className="font-bold text-slate-800 text-base leading-tight">{lead.companyName}</h4>
                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-500 uppercase shrink-0 ml-2">{lead.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4 pointer-events-none">
                    <span className="text-xs bg-blue-50 text-lamitex-blue px-3 py-1 rounded-full font-bold border border-blue-100">
                      {lead.segment}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
                      {lead.niche}
                    </span>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-50 pt-4 mt-1 pointer-events-none">
                    <div className="flex flex-col">
                       <span className="text-[11px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Orçamento</span>
                       <span className="text-base font-black text-slate-700">
                         {lead.value && lead.value > 0 ? `R$ ${lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                       </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">ID: #{lead.id.slice(-4)}</span>
                  </div>
                </div>
              ))}
              
              {columnLeads.length === 0 && (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-sm font-black uppercase tracking-widest p-6 text-center">
                  Vazio
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
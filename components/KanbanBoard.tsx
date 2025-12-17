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
    <div className="flex space-x-4 overflow-x-auto pb-4 h-full items-start">
      {COLUMNS.map(col => {
        const columnLeads = leads.filter(l => l.status === col.id);
        const totalValue = getColumnTotal(col.id);

        return (
          <div 
            key={col.id} 
            className={`min-w-[310px] bg-slate-100/50 rounded-xl flex flex-col h-full border-t-[6px] shadow-sm transition-all duration-200 ${draggedLeadId ? 'bg-slate-200/50 scale-[0.99]' : ''}`}
            style={{borderColor: col.color.replace('border-', '')}}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className="p-4 bg-white rounded-t-lg border-b border-slate-200 sticky top-0 z-10 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-700 text-xs uppercase tracking-widest">{col.label}</h3>
                <span className="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  {columnLeads.length}
                </span>
              </div>
              <div className="flex flex-col bg-slate-50 p-2 rounded border border-slate-100">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Valor Acumulado</span>
                 <span className="text-sm font-black text-lamitex-blue">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Cards Container */}
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar min-h-[150px]">
              {columnLeads.map(lead => (
                <div 
                  key={lead.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-lamitex-blue hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
                >
                  <div className="flex justify-between items-start mb-2 pointer-events-none">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{lead.companyName}</h4>
                    <span className="text-[9px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase">{lead.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3 pointer-events-none">
                    <span className="text-[9px] bg-blue-50 text-lamitex-blue px-2 py-0.5 rounded-full font-bold border border-blue-100">
                      {lead.segment}
                    </span>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {lead.niche}
                    </span>
                  </div>

                  <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-1 pointer-events-none">
                    <div className="flex flex-col">
                       <span className="text-[9px] text-slate-400 uppercase font-bold">Orçamento</span>
                       <span className="text-sm font-bold text-slate-700">
                         {lead.value && lead.value > 0 ? `R$ ${lead.value.toLocaleString()}` : 'R$ 0,00'}
                       </span>
                    </div>
                    <span className="text-[10px] text-slate-400">ID: #{lead.id.slice(-4)}</span>
                  </div>
                </div>
              ))}
              
              {columnLeads.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-xs font-medium uppercase tracking-widest p-4">
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
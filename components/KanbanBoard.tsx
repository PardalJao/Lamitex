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

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    if (!draggedLeadId) return;
    setLeads(prev => prev.map(lead => lead.id === draggedLeadId ? { ...lead, status: targetStatus } : lead));
    setDraggedLeadId(null);
  };

  const getColumnTotal = (status: Lead['status']) => {
    return leads
      .filter(l => l.status === status)
      .reduce((sum, item) => sum + (item.value || 0), 0);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6 h-full items-start px-2 no-scrollbar">
      {COLUMNS.map(col => {
        const columnLeads = leads.filter(l => l.status === col.id);
        const totalValue = getColumnTotal(col.id);

        return (
          <div 
            key={col.id} 
            className={`min-w-[340px] bg-slate-200/50 rounded-2xl flex flex-col h-full border-t-[8px] transition-all ${draggedLeadId ? 'bg-slate-300/50' : ''}`}
            style={{borderColor: col.color.replace('border-', '')}}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="p-5 bg-white rounded-t-xl border-b border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-widest">{col.label}</h3>
                <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-lg text-xs font-black">
                  {columnLeads.length}
                </span>
              </div>
              <p className="text-lg font-black text-blue-600">R$ {totalValue.toLocaleString('pt-BR')}</p>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar min-h-[400px]">
              {columnLeads.map(lead => (
                <div 
                  key={lead.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 transition-all cursor-grab active:cursor-grabbing"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-800 text-base leading-tight">{lead.companyName}</h4>
                    <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-500 uppercase">{lead.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-[11px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                      {lead.segment}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-base font-black text-slate-700">
                      {lead.value ? `R$ ${lead.value.toLocaleString('pt-BR')}` : 'R$ 0'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">ID #{lead.id.slice(-4)}</span>
                  </div>
                </div>
              ))}
              
              {columnLeads.length === 0 && (
                <div className="h-32 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-black uppercase tracking-widest">
                  VAZIO
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
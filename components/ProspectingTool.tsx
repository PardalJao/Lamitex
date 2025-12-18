import React, { useState } from 'react';
import { searchProspects, Prospect } from '../services/geminiService';
import { Lead, LeadSegment } from '../types';

interface ProspectingToolProps {
  addLead: (lead: Lead) => void;
}

const SUGGESTED_NICHES = [
  { id: 'auto', label: 'Tapeçaria Automotiva', focus: 'Curvim, Diamante', icon: '🚗' },
  { id: 'brindes', label: 'Fábrica de Brindes', focus: 'Neotex, Bagum', icon: '🎒' },
  { id: 'jeans', label: 'Confecção / Jeans', focus: 'PU Queima, Alpes', icon: '👖' },
];

const ProspectingTool: React.FC<ProspectingToolProps> = ({ addLead }) => {
  const [location, setLocation] = useState('');
  const [nicheInput, setNicheInput] = useState('');
  const [resultsText, setResultsText] = useState<string | null>(null);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [groundingLinks, setGroundingLinks] = useState<{ title: string, uri: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedProspects, setAddedProspects] = useState<Set<string>>(new Set());

  const handleSearch = async () => {
    if (!nicheInput.trim()) return;
    
    setIsSearching(true);
    setResultsText(null);
    setProspects([]);
    setGroundingLinks([]);
    setAddedProspects(new Set()); // Reset added status on new search
    
    const searchLocation = location.trim() || 'São Paulo';
    
    const result = await searchProspects(nicheInput, searchLocation);
    
    setResultsText(result.text);
    setProspects(result.prospects);
    setGroundingLinks(result.groundingLinks || []);
    setIsSearching(false);
  };

  const handleAddToPipeline = (p: Prospect) => {
    const prospectKey = `${p.companyName}-${p.address}`;
    if (addedProspects.has(prospectKey)) return;

    // Determine the segment based on the niche
    let segment: LeadSegment = 'Indústria';
    const nicheLower = nicheInput.toLowerCase();
    if (nicheLower.includes('tapeçaria') || nicheLower.includes('automotiva')) {
      segment = 'Tapeçaria Profissional';
    } else if (nicheLower.includes('varejo') || nicheLower.includes('loja')) {
      segment = 'Varejo';
    } else if (nicheLower.includes('atacado') || nicheLower.includes('distribuidora')) {
      segment = 'Atacado';
    }

    const newLead: Lead = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      companyName: p.companyName,
      contactName: 'A descobrir',
      location: p.address.split(',')[0] || p.address, // Simplify address for card
      niche: nicheInput,
      segment: segment,
      status: 'prospecting',
      value: 0
    };
    
    addLead(newLead);
    setAddedProspects(prev => new Set(prev).add(prospectKey));
  };

  return (
    <div className="h-full flex flex-col space-y-8 p-6 lg:p-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-black text-slate-800 mb-5 flex items-center">
          <span className="text-3xl mr-4">🌍</span> Prospecção Inteligente (Maps)
        </h2>
        <p className="text-base text-slate-500 mb-8 font-medium">
          Defina o nicho e a localização para encontrar novos clientes e adicionar diretamente ao pipeline de vendas da Lamitex.
        </p>

        {/* Inputs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-widest">Nicho / Segmento</label>
            <input 
              type="text" 
              placeholder="Ex: Tapeçaria, Brindes, Calçados..." 
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-4 focus:ring-lamitex-blue/10 focus:border-lamitex-blue placeholder-slate-400 font-bold transition-all"
            />
            {/* Quick Select Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTED_NICHES.map(n => (
                <button
                  key={n.id}
                  onClick={() => setNicheInput(n.label)}
                  className="text-xs font-black bg-slate-100 text-slate-600 px-4 py-2 rounded-full hover:bg-lamitex-blue hover:text-white transition-all border border-slate-200"
                >
                  {n.icon} {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-widest">Localização Alvo</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ex: Bom Retiro, SP" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-2xl px-5 py-4 pl-12 text-base focus:outline-none focus:ring-4 focus:ring-lamitex-blue/10 focus:border-lamitex-blue placeholder-slate-400 font-bold transition-all"
              />
              <span className="absolute left-4 top-4 text-xl">📍</span>
            </div>
          </div>
        </div>

        <button 
           onClick={handleSearch}
           disabled={!nicheInput || isSearching}
           className="w-full md:w-auto bg-lamitex-blue text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-800 disabled:opacity-50 transition-all shadow-xl shadow-blue-900/30 flex items-center justify-center space-x-3 active:scale-[0.98]"
        >
          {isSearching ? (
             <>
               <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
               <span>Processando Nath...</span>
             </>
          ) : (
             <>
               <span className="text-xl">🔍</span>
               <span>Buscar Leads Agora</span>
             </>
          )}
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <h3 className="text-xl font-black text-slate-700 mb-6 border-b border-slate-100 pb-4 uppercase tracking-tighter">Resultados Estratégicos</h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isSearching ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-6">
                    <div className="w-16 h-16 border-4 border-lamitex-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-bold">A Nath está consultando o Google Maps e analisando o perfil comercial...</p>
                </div>
            ) : prospects.length > 0 ? (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {prospects.map((p, idx) => {
                        const prospectKey = `${p.companyName}-${p.address}`;
                        const isAdded = addedProspects.has(prospectKey);

                        return (
                          <div key={idx} className="border border-slate-200 rounded-3xl p-6 hover:shadow-xl transition-all bg-slate-50/50 group">
                            <h4 className="font-black text-slate-800 text-xl mb-1">{p.companyName}</h4>
                            <p className="text-sm text-slate-500 mb-4 font-bold">{p.address}</p>
                            <div className="bg-blue-50 text-lamitex-blue text-xs font-black inline-block px-4 py-1.5 rounded-full border border-blue-100 mb-6 uppercase tracking-widest">
                              Recomendado: {p.recommendedProduct}
                            </div>
                            <button
                              onClick={() => handleAddToPipeline(p)}
                              disabled={isAdded}
                              className={`w-full py-4 font-black rounded-2xl transition-all flex items-center justify-center space-x-3 text-base active:scale-95 ${
                                isAdded 
                                  ? 'bg-green-600 text-white cursor-default border border-green-600 shadow-md' 
                                  : 'bg-white border-2 border-lamitex-blue text-lamitex-blue hover:bg-lamitex-blue hover:text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <span className="text-xl">✅</span>
                                  <span>Adicionado ao Pipeline</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-xl">+</span>
                                  <span>Adicionar ao Pipeline</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                   </div>

                   {/* Grounding URLs */}
                   {groundingLinks.length > 0 && (
                     <div className="border-t pt-8">
                       <h4 className="text-base font-black text-slate-600 mb-4 flex items-center">
                         <span className="mr-3 text-xl">🔗</span> Referências Oficiais no Maps:
                       </h4>
                       <div className="flex flex-wrap gap-3">
                         {groundingLinks.map((link, idx) => (
                           <a 
                             key={idx} 
                             href={link.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-xs font-black text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 transition-all uppercase tracking-widest"
                           >
                             {link.title}
                           </a>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Resumo */}
                   {resultsText && !resultsText.includes("```json") && (
                     <div className="mt-6 text-sm text-slate-600 border-t pt-8 bg-slate-50 p-6 rounded-3xl">
                        <p className="font-black text-slate-800 mb-3 uppercase tracking-widest text-xs">Resumo da Análise Nath:</p>
                        <div className="whitespace-pre-line leading-relaxed font-bold">{resultsText.replace(/```json[\s\S]*```/, '')}</div>
                     </div>
                   )}
                </div>
            ) : resultsText ? (
                <div className="prose prose-slate max-w-none text-base font-bold leading-relaxed p-4">
                   {resultsText}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
                    <span className="text-6xl mb-6">🏭</span>
                    <p className="text-lg font-black uppercase tracking-widest">Encontre empresas agora</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProspectingTool;
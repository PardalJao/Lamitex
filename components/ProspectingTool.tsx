
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

    // Determine the segment based on the niche to satisfy the required property in Lead
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
    <div className="h-full flex flex-col space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🌍</span> Prospecção Inteligente (Google Maps)
        </h2>
        <p className="text-slate-500 mb-6">
          Defina o nicho e a localização para encontrar novos clientes e adicionar diretamente ao pipeline.
        </p>

        {/* Inputs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nicho / Segmento</label>
            <input 
              type="text" 
              placeholder="Ex: Tapeçaria, Brindes, Calçados..." 
              value={nicheInput}
              onChange={(e) => setNicheInput(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lamitex-blue placeholder-slate-400"
            />
            {/* Quick Select Tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {SUGGESTED_NICHES.map(n => (
                <button
                  key={n.id}
                  onClick={() => setNicheInput(n.label)}
                  className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  {n.icon} {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Localização Alvo</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ex: Bom Retiro, SP" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-lamitex-blue placeholder-slate-400"
              />
              <span className="absolute left-3 top-3.5 text-slate-400">📍</span>
            </div>
          </div>
        </div>

        <button 
           onClick={handleSearch}
           disabled={!nicheInput || isSearching}
           className="w-full md:w-auto bg-lamitex-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-lg shadow-blue-900/30 flex items-center justify-center space-x-2"
        >
          {isSearching ? (
             <>
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               <span>Processando...</span>
             </>
          ) : (
             <>
               <span>🔍</span>
               <span>Buscar Leads</span>
             </>
          )}
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <h3 className="text-lg font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Resultados Encontrados</h3>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isSearching ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                    <div className="w-12 h-12 border-4 border-lamitex-blue border-t-transparent rounded-full animate-spin"></div>
                    <p>Consultando Google Maps e analisando perfil...</p>
                </div>
            ) : prospects.length > 0 ? (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prospects.map((p, idx) => {
                        const prospectKey = `${p.companyName}-${p.address}`;
                        const isAdded = addedProspects.has(prospectKey);

                        return (
                          <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-slate-50">
                            <h4 className="font-bold text-slate-800 text-lg">{p.companyName}</h4>
                            <p className="text-sm text-slate-500 mb-2">{p.address}</p>
                            <div className="bg-blue-50 text-lamitex-blue text-xs inline-block px-2 py-1 rounded border border-blue-100 mb-4">
                              Sugerir: {p.recommendedProduct}
                            </div>
                            <button
                              onClick={() => handleAddToPipeline(p)}
                              disabled={isAdded}
                              className={`w-full py-2 font-semibold rounded transition-all flex items-center justify-center space-x-2 ${
                                isAdded 
                                  ? 'bg-green-600 text-white cursor-default border border-green-600 shadow-sm' 
                                  : 'bg-white border border-lamitex-blue text-lamitex-blue hover:bg-blue-50'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <span>✅</span>
                                  <span>Adicionado com sucesso</span>
                                </>
                              ) : (
                                <span>+ Adicionar ao Pipeline</span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                   </div>

                   {/* Mandatory extraction and display of grounding URLs from Google Maps */}
                   {groundingLinks.length > 0 && (
                     <div className="border-t pt-4">
                       <h4 className="text-sm font-bold text-slate-600 mb-2 flex items-center">
                         <span className="mr-2">🔗</span> Referências Diretas no Maps:
                       </h4>
                       <div className="flex flex-wrap gap-2">
                         {groundingLinks.map((link, idx) => (
                           <a 
                             key={idx} 
                             href={link.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100 transition-colors hover:bg-blue-100"
                           >
                             {link.title}
                           </a>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Fallback text display just in case */}
                   {resultsText && !resultsText.includes("```json") && (
                     <div className="mt-4 text-xs text-slate-400 border-t pt-4">
                        <p className="font-bold mb-1">Resumo da IA:</p>
                        <div className="whitespace-pre-line">{resultsText.replace(/```json[\s\S]*```/, '')}</div>
                     </div>
                   )}
                </div>
            ) : resultsText ? (
                <div className="prose prose-slate max-w-none text-sm">
                   {resultsText}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                    <span className="text-4xl mb-2">🏭</span>
                    <p>Preencha os filtros acima para encontrar empresas.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProspectingTool;

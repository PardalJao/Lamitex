import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dataSegments = [
  { name: 'Tapeçaria Prof.', value: 45 },
  { name: 'Atacado', value: 25 },
  { name: 'Indústria', value: 20 },
  { name: 'Varejo', value: 10 },
];

const dataByAudienceAndCategory = [
  { name: 'Auto', Tapeçaria: 80, Atacado: 20, Varejo: 5 },
  { name: 'Brindes', Tapeçaria: 5, Atacado: 45, Varejo: 15 },
  { name: 'Moda', Tapeçaria: 2, Atacado: 30, Varejo: 40 },
];

const dataTopProducts = [
  { name: 'Curvim Original', requests: 145, category: 'Automotiva' },
  { name: 'Diamante Premium', requests: 120, category: 'Automotiva' },
  { name: 'Montana', requests: 88, category: 'Moda & Decoração' },
  { name: 'PU Queima', requests: 72, category: 'Moda & Decoração' },
  { name: 'Bagum', requests: 45, category: 'Acessórios & Brindes' },
];

const COLORS = ['#0047AB', '#3B82F6', '#64748B', '#94A3B8', '#CBD5E1'];

const Dashboard: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'Tudo' | 'Automotiva' | 'Acessórios & Brindes' | 'Moda & Decoração'>('Tudo');

  const filteredProducts = activeCategory === 'Tudo' 
    ? dataTopProducts 
    : dataTopProducts.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-6 lg:space-y-8 pb-10 p-5 lg:p-8">
      {/* Header with Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 lg:p-7 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h3 className="text-lg font-black text-slate-800 tracking-tight">Visão da Nath</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Inteligência de Mercado em Tempo Real</p>
        </div>
        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-3 no-scrollbar">
          {['Tudo', 'Automotiva', 'Acessórios & Brindes', 'Moda & Decoração'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border shrink-0 ${
                activeCategory === cat 
                  ? 'bg-lamitex-blue text-white border-lamitex-blue shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-lamitex-blue'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'Contatos', val: '1.2k', sub: 'Mensal', color: 'text-blue-600' },
          { label: 'Tapeçaria', val: '62%', sub: 'Nicho Top', color: 'text-slate-800' },
          { label: 'Ticket Méd.', val: 'R$ 12k', sub: 'Atacado', color: 'text-green-600' },
          { label: 'Conversão', val: '4.2%', sub: 'Lead→Pedido', color: 'text-orange-600' }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col justify-between h-36">
            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest">{kpi.label}</h3>
            <p className={`text-3xl lg:text-4xl font-black ${kpi.color} mt-2`}>{kpi.val}</p>
            <span className="text-xs font-bold bg-slate-50 text-slate-400 px-3 py-1 rounded-full w-fit mt-2">{kpi.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Most Sought After Products */}
        <div className="lg:col-span-2 bg-white p-7 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[450px]">
          <h3 className="text-base font-black text-slate-800 mb-6 uppercase tracking-tighter">Ranking de Interesse</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredProducts} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={130} tick={{fontSize: 11, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 'bold' }}
                />
                <Bar dataKey="requests" fill="#0047AB" radius={[0, 8, 8, 0]} barSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audience Segment Distribution */}
        <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-[450px]">
          <h3 className="text-base font-black text-slate-800 mb-1 uppercase tracking-tighter">Perfil Comprador</h3>
          <p className="text-xs text-slate-400 mb-6 font-bold">Distribuição por Segmento</p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dataSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '16px', fontSize: '12px', fontWeight: 'bold'}} />
                <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deep Dive: Audience vs Category */}
      <div className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-base font-black text-slate-800 mb-8 uppercase tracking-tighter">Cruzamento de Demanda</h3>
        <div className="h-80 lg:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataByAudienceAndCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '13px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{paddingBottom: '30px', fontSize: '12px', fontWeight: 'bold'}} iconType="rect" />
              <Bar dataKey="Tapeçaria" fill="#0047AB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Atacado" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Varejo" fill="#94A3B8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
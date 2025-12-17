import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import ProspectingTool from './components/ProspectingTool';
import ChatInterface from './components/ChatInterface';
import { ViewState, Lead } from './types';
import { INITIAL_LEADS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);

  const addLead = (lead: Lead) => {
    setLeads(prev => [...prev, lead]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard leads={leads} setLeads={setLeads} />;
      case 'prospecting':
        return <ProspectingTool addLead={addLead} />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
import React, { useState } from 'react';
import { TaxProvider } from './context/TaxContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AIMonitorView from './components/AIMonitorView';
import ChatView from './components/ChatView';
import CalendarView from './components/CalendarView';
import CompareView from './components/CompareView';
import WorkflowView from './components/WorkflowView';
import CalculatorView from './components/CalculatorView';
import AnalyticsView from './components/AnalyticsView';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView setActiveView={setActiveView} />;
      case 'agent':
        return <AIMonitorView />;
      case 'chat':
        return <ChatView />;
      case 'calendar':
        return <CalendarView />;
      case 'compare':
        return <CompareView />;
      case 'workflow':
        return <WorkflowView />;
      case 'calculator':
        return <CalculatorView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <DashboardView setActiveView={setActiveView} />;
    }
  };

  return (
    <TaxProvider>
      <div className="app-container">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <div className="main-content">
          <Header />
          <main className="page-container">
            {renderContent()}
          </main>
        </div>
      </div>
    </TaxProvider>
  );
}

export default App;

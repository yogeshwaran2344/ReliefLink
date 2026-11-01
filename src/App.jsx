import React, { useState } from 'react';
import { ReliefProvider, useRelief } from './context/ReliefContext';
import Navbar from './components/Navbar';
import Module1_Dashboard from './components/Module1_Dashboard';
import Module2_RequestManagement from './components/Module2_RequestManagement';
import Module3_AIPriorityDemand from './components/Module3_AIPriorityDemand';
import Module4_WarehouseInventory from './components/Module4_WarehouseInventory';
import Module5_AllocationEngine from './components/Module5_AllocationEngine';
import Module6_RouteOptimization from './components/Module6_RouteOptimization';
import Module7_DeliveryVerification from './components/Module7_DeliveryVerification';
import Module8_ReportsAnalytics from './components/Module8_ReportsAnalytics';
import AccountabilityLedger from './components/AccountabilityLedger';
import ToastContainer from './components/ToastContainer';
import DisasterScenarioSimulator from './components/DisasterScenarioSimulator';
import RoleSwitcherModal from './components/RoleSwitcherModal';
import NotificationCenter from './components/NotificationCenter';
import CommandPalette from './components/CommandPalette';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import InnovationTwinModal from './components/InnovationTwinModal';
import QRVerificationModal from './components/QRVerificationModal';
import { Terminal, Shield, ChevronUp, ChevronDown, Bot, Sparkles } from 'lucide-react';

function MainContent() {
  const { activeTab, auditLogs } = useRelief();
  const [showLogs, setShowLogs] = useState(false);

  // Modal Open States
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isTwinOpen, setIsTwinOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      <Navbar
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenNotif={() => setIsNotifOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenTwin={() => setIsTwinOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Module1_Dashboard />}
        {activeTab === 'requests' && <Module2_RequestManagement />}
        {activeTab === 'priority' && <Module3_AIPriorityDemand />}
        {activeTab === 'inventory' && <Module4_WarehouseInventory />}
        {activeTab === 'allocation' && <Module5_AllocationEngine />}
        {activeTab === 'routing' && <Module6_RouteOptimization />}
        {activeTab === 'tracking' && <Module7_DeliveryVerification />}
        {activeTab === 'reports' && <Module8_ReportsAnalytics />}
        {activeTab === 'ledger' && <AccountabilityLedger />}
      </main>

      {/* Interactive Enterprise Modals */}
      <DisasterScenarioSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
      <InnovationTwinModal
        isOpen={isTwinOpen}
        onClose={() => setIsTwinOpen(false)}
      />
      <QRVerificationModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
      />

      {/* Floating System Toasts */}
      <ToastContainer />

      {/* Floating AI Disaster Operations Copilot Trigger Button */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-12 right-4 z-40 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold border border-rose-400/40 transition transform hover:scale-105 active:scale-95"
        title="Open ReliefLink Conversational Operations Assistant"
      >
        <Bot className="w-4 h-4 animate-bounce" />
        <span className="hidden sm:inline">🤖 ReliefLink Copilot</span>
        <span className="sm:hidden">Copilot</span>
      </button>

      {/* Floating Real-Time Operational Audit Drawer */}
      <div className="fixed bottom-0 right-4 z-30 w-96 max-w-[calc(100vw-2rem)]">
        <div className="bg-slate-900 border border-slate-700 rounded-t-xl shadow-2xl overflow-hidden">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full px-3 py-2 bg-slate-800/90 hover:bg-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 border-b border-slate-700"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live System Event Ledger ({auditLogs.length})</span>
            </div>
            {showLogs ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          {showLogs && (
            <div className="p-2.5 max-h-56 overflow-y-auto space-y-1.5 text-[11px] font-mono bg-slate-950">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-slate-300 flex items-start gap-1.5 border-b border-slate-800/60 pb-1">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                    log.category === 'SECURITY' ? 'bg-rose-500/20 text-rose-400' :
                    log.category === 'AI_ALLOCATION' ? 'bg-indigo-500/20 text-indigo-400' :
                    log.category === 'SURPLUS_TRANSFER' ? 'bg-blue-500/20 text-blue-400' :
                    log.category === 'SIMULATION' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {log.category}
                  </span>
                  <span className="break-all">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>
          ReliefLink: Autonomous Multi-Constraint Disaster Logistics Platform • Built for Hackathon & Presentation Defense
        </p>
      </footer>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ReliefLink Runtime Caught Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-6 bg-slate-900 border border-rose-500/50 rounded-2xl text-center space-y-4 shadow-2xl">
          <div className="inline-flex p-3 rounded-full bg-rose-500/20 text-rose-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Operational Module Recovered</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto font-mono">
            {this.state.error?.message || 'Component initialization error'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/30"
          >
            Reload Module View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ReliefProvider>
        <MainContent />
      </ReliefProvider>
    </ErrorBoundary>
  );
}

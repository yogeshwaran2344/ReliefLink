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
import { Terminal, Shield, ChevronUp, ChevronDown } from 'lucide-react';

function MainContent() {
  const { activeTab, auditLogs } = useRelief();
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <Module1_Dashboard />}
        {activeTab === 'requests' && <Module2_RequestManagement />}
        {activeTab === 'priority' && <Module3_AIPriorityDemand />}
        {activeTab === 'inventory' && <Module4_WarehouseInventory />}
        {activeTab === 'allocation' && <Module5_AllocationEngine />}
        {activeTab === 'routing' && <Module6_RouteOptimization />}
        {activeTab === 'tracking' && <Module7_DeliveryVerification />}
        {activeTab === 'reports' && <Module8_ReportsAnalytics />}
      </main>

      {/* Floating Real-Time Operational Audit Drawer */}
      <div className="fixed bottom-0 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
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

export default function App() {
  return (
    <ReliefProvider>
      <MainContent />
    </ReliefProvider>
  );
}

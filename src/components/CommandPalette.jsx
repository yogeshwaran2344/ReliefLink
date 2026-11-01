import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  LayoutDashboard,
  ClipboardList,
  Cpu,
  Warehouse,
  GitFork,
  Truck,
  ShieldCheck,
  BarChart3,
  Sparkles,
  AlertTriangle,
  QrCode,
  Shield,
  Coins,
  ArrowRight,
  X
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function CommandPalette({ isOpen, onClose, onOpenSimulator, onOpenQR, onOpenRoleModal }) {
  const {
    camps,
    warehouses,
    vehicles,
    setActiveTab,
    toggleBlockage,
    triggerAIAllocation,
    addToast
  } = useRelief();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // toggle trigger
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'cmd-critical-camps',
      title: 'Show camps with critical water shortages',
      category: 'Triage Query',
      icon: AlertTriangle,
      action: () => {
        setActiveTab('priority');
        addToast('info', 'Filtering camps with Critical Priority (Score >= 85)', 'Omni-Search');
        onClose();
      }
    },
    {
      id: 'cmd-simulator',
      title: 'Open What-If Disaster Response Simulator',
      category: 'Simulation',
      icon: Sparkles,
      action: () => {
        onOpenSimulator();
        onClose();
      }
    },
    {
      id: 'cmd-qr',
      title: 'Generate & Scan QR Delivery Consignment Pass',
      category: 'Traceability',
      icon: QrCode,
      action: () => {
        onOpenQR();
        onClose();
      }
    },
    {
      id: 'cmd-run-allocation',
      title: 'Trigger Multi-Constraint AI Resource Allocation',
      category: 'AI Engine',
      icon: GitFork,
      action: () => {
        setActiveTab('allocation');
        triggerAIAllocation();
        onClose();
      }
    },
    {
      id: 'cmd-switch-role',
      title: 'Switch Role & Authority (Admin, Coordinator, Volunteer...)',
      category: 'Security & Access',
      icon: Shield,
      action: () => {
        onOpenRoleModal();
        onClose();
      }
    },
    {
      id: 'cmd-block-hwy4',
      title: 'Simulate Road Blockage on Highway 4 Bypass',
      category: 'Fleet Operations',
      icon: AlertTriangle,
      action: () => {
        toggleBlockage('blk-1');
        setActiveTab('routing');
        onClose();
      }
    },
    {
      id: 'cmd-financial-ledger',
      title: 'Inspect Financial Accountability & Shrinkage Ledger',
      category: 'Audit & Compliance',
      icon: Coins,
      action: () => {
        setActiveTab('ledger');
        onClose();
      }
    },
    {
      id: 'cmd-surplus-redistribution',
      title: 'Inspect Warehouse Surplus Redistribution (USP)',
      category: 'Warehouses',
      icon: Warehouse,
      action: () => {
        setActiveTab('inventory');
        onClose();
      }
    }
  ];

  const filtered = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-[2800] flex items-start justify-center pt-20 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slideDown"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-rose-500 shrink-0" />
          <input
            type="text"
            placeholder="Type a natural command (e.g. 'Show critical camps', 'Simulate blockage', 'QR pass')..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-mono border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between group transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-rose-500/20 group-hover:text-rose-400 text-slate-400 transition">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-rose-300">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition" />
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching commands or disaster entities found. Try "critical", "simulator", "ledger", or "blockage".
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>ReliefLink Natural AI Command Palette</span>
          <span className="font-mono">Press [Ctrl+K] anytime</span>
        </div>
      </div>
    </div>
  );
}

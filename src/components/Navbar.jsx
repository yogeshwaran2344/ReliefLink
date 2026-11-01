import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Cpu,
  Warehouse,
  GitFork,
  Truck,
  ShieldCheck,
  BarChart3,
  RotateCcw,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function Navbar() {
  const { activeTab, setActiveTab, resetDemoData, blockages, toggleBlockage, backendConnected } = useRelief();

  const navItems = [
    { id: 'dashboard', label: '1. Command Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: '2. Request Management', icon: ClipboardList },
    { id: 'priority', label: '3. AI Priority & Demand', icon: Cpu, badge: 'AI Core' },
    { id: 'inventory', label: '4. Warehouses & Surplus', icon: Warehouse, badge: 'USP' },
    { id: 'allocation', label: '5. Resource Allocation', icon: GitFork, badge: 'Key Engine' },
    { id: 'routing', label: '6. Vehicle & Routing', icon: Truck },
    { id: 'tracking', label: '7. Delivery Verification', icon: ShieldCheck, badge: 'Audit' },
    { id: 'reports', label: '8. Reports & Analytics', icon: BarChart3 },
  ];

  const activeHazard = blockages.some(b => b.active);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      {/* Top Incident Banner */}
      <div className="bg-rose-950/80 border-b border-rose-900/60 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-rose-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <span className="font-bold tracking-wider uppercase text-rose-300">CRISIS OPERATIONAL STATUS:</span>
          <span>Level-3 Coastal Surge & Monsoon Flood Incident Active | 5 Affected Camps | 3 Depots Online</span>
        </div>
        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <button
            onClick={() => toggleBlockage('blk-1')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              activeHazard
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            {activeHazard ? 'Hazard Active (Highway 4 Blocked)' : 'Simulate Road Blockage'}
          </button>

          <button
            onClick={resetDemoData}
            title="Reset system to default 5 Camps / 3 Warehouses / 3 Vehicles"
            className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Main Brand & Module Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ReliefLink
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Autonomous Ops
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Physical AI & Algorithmic Disaster Supply Chain</p>
            </div>
          </div>

          {/* Quick status summary badge */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300">
            <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 border ${
              backendConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{backendConnected ? 'Database Synced (FastAPI :8000)' : 'Standalone Local DB'}</span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>OR-Tools Routing: <b>Online</b></span>
            </div>
          </div>
        </div>

        {/* 8 Module Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/80 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 ring-1 ring-rose-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

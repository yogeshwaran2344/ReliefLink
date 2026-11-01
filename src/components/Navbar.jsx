import React, { useState } from 'react';
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
  Radio,
  Sparkles,
  Bell,
  User,
  ShieldAlert,
  Coins,
  Search,
  Activity,
  QrCode
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function Navbar({
  onOpenSimulator,
  onOpenRoleModal,
  onOpenNotif,
  onOpenSearch,
  onOpenTwin,
  onOpenQR
}) {
  const {
    camps,
    warehouses,
    activeTab,
    setActiveTab,
    resetDemoData,
    setupAroundCurrentLocation,
    clearAllData,
    userLocation,
    locationLoading,
    detectUserLocation,
    blockages,
    toggleBlockage,
    backendConnected,
    currentUser,
    notifications
  } = useRelief();

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const navItems = [
    { id: 'dashboard', label: '1. Command Dashboard', icon: LayoutDashboard },
    { id: 'requests', label: '2. Request Management', icon: ClipboardList },
    { id: 'priority', label: '3. AI Priority & Demand', icon: Cpu, badge: 'AI Core' },
    { id: 'inventory', label: '4. Warehouses & Surplus', icon: Warehouse, badge: 'USP' },
    { id: 'allocation', label: '5. Resource Allocation', icon: GitFork, badge: 'Key Engine' },
    { id: 'routing', label: '6. Vehicle & Routing', icon: Truck },
    { id: 'tracking', label: '7. Delivery Verification', icon: ShieldCheck, badge: 'Audit' },
    { id: 'reports', label: '8. Reports & Analytics', icon: BarChart3 },
    { id: 'ledger', label: '9. Financial & Loss Ledger', icon: Coins, badge: 'Anti-Theft' },
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
          <span className="font-bold tracking-wider uppercase text-rose-300">
            {camps.length === 0 ? 'CLEAN SLATE ACTIVE:' : 'CRISIS OPERATIONAL STATUS:'}
          </span>
          <span>
            {camps.length === 0
              ? 'Zero Demo Records • Ready for real GPS deployment'
              : `Active Sector: ${camps.length} Camps | ${warehouses.length} Depots Online`}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {/* Real GPS Indicator Badge */}
          <button
            onClick={detectUserLocation}
            className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold flex items-center gap-1.5 bg-blue-950/80 border border-blue-500/50 text-blue-300 hover:text-white transition"
            title="Click to refresh browser GPS"
          >
            <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`}></span>
            <span>
              {userLocation
                ? `📍 ${userLocation.lat}, ${userLocation.lng}`
                : locationLoading
                ? '📍 Acquiring GPS...'
                : '📍 Click to Lock GPS'}
            </span>
          </button>

          {/* Innovations & Digital Twin Button */}
          <button
            onClick={onOpenTwin}
            className="px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 bg-purple-600/80 hover:bg-purple-600 text-purple-100 border border-purple-400/40 shadow-sm"
          >
            <Activity className="w-3 h-3 text-purple-200" />
            <span>⚡ Digital Twin</span>
          </button>

          {/* What-If Simulator Button */}
          <button
            onClick={onOpenSimulator}
            className="px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm hover:from-amber-400 hover:to-rose-400"
          >
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>⚡ Simulator</span>
          </button>

          {/* Cluster Setup or Wipe Button */}
          {camps.length === 0 ? (
            <button
              onClick={() => setupAroundCurrentLocation(userLocation?.lat, userLocation?.lng)}
              className="px-2.5 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm transition"
              title="Initialize 3 Camps & 2 Depots centered at your GPS"
            >
              <Sparkles className="w-3 h-3" />
              <span>Setup at My GPS</span>
            </button>
          ) : (
            <button
              onClick={clearAllData}
              title="Reset system to zero records (Clean Slate)"
              className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Wipe to 0</span>
            </button>
          )}
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

          {/* Right Header Action Items */}
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            {/* Omni-Search Command Palette Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 transition group"
              title="Command Palette & Quick Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition" />
              <span className="hidden md:inline text-slate-300 text-[11px]">Command Search...</span>
              <kbd className="hidden sm:inline-block text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-slate-400">
                Ctrl+K
              </kbd>
            </button>

            {/* Backend Connectivity Badge */}
            <div className={`hidden lg:flex px-2.5 py-1.5 rounded-lg items-center gap-2 border text-[11px] ${
              backendConnected
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{backendConnected ? 'Backend Connected (:8000)' : 'Local Engine Ready'}</span>
            </div>

            {/* In-App Notifications Bell */}
            <button
              onClick={onOpenNotif}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Notifications & Smart Correlated Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* RBAC Role Switcher Pill */}
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left transition group"
              title="Switch RBAC Role (Super Admin, Coordinator, Warehouse Manager, etc.)"
            >
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                {currentUser?.role?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-semibold text-slate-200 group-hover:text-rose-400 leading-tight">
                  {currentUser?.name || 'Authorized User'}
                </div>
                <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {currentUser?.role || 'Coordinator'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 9 Module Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/80 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 ring-1 ring-rose-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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

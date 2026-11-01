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
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function Navbar({
  onOpenSimulator,
  onOpenRoleModal,
  onOpenNotif,
  onOpenSearch,
  onOpenTwin
}) {
  const {
    camps,
    warehouses,
    activeTab,
    setActiveTab,
    setupAroundCurrentLocation,
    clearAllData,
    userLocation,
    locationLoading,
    detectUserLocation,
    currentUser,
    notifications
  } = useRelief();

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'requests', label: 'Relief Requests', icon: ClipboardList },
    { id: 'priority', label: 'AI Triage & Demand', icon: Cpu, badge: 'AI' },
    { id: 'inventory', label: 'Depot & Surplus', icon: Warehouse, badge: 'USP' },
    { id: 'allocation', label: 'Resource Allocation', icon: GitFork },
    { id: 'routing', label: 'Fleet & Routing', icon: Truck },
    { id: 'tracking', label: 'Delivery Verification', icon: ShieldCheck },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'ledger', label: 'Material Ledger', icon: Coins }
  ];

  return (
    <header className="glass-panel sticky top-0 z-50 shadow-2xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-rose-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Relief<span className="text-blue-500">Link</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  EOC v2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Disaster Logistics & Autonomous Response Platform</p>
            </div>
          </div>

          {/* Live GPS Telemetry Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-400 text-[11px]">GPS:</span>
            <span className="font-mono text-slate-200 font-semibold text-[11px]">
              {userLocation
                ? `${userLocation.lat}, ${userLocation.lng} (±${userLocation.accuracy}m)`
                : (locationLoading ? 'Acquiring coordinates...' : 'Telemetry Standby')}
            </span>
            <button
              onClick={detectUserLocation}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
              title="Refresh GPS telemetry"
            >
              <RefreshCw className={`w-3 h-3 ${locationLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            {/* Quick Demo GPS Setup / Clean Slate Action */}
            {camps.length === 0 ? (
              <button
                onClick={() => setupAroundCurrentLocation(userLocation?.lat, userLocation?.lng)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-600/25 transition transform active:scale-95"
                title="Initialize 3 Camps & 2 Depots centered at your GPS"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Setup at My GPS</span>
              </button>
            ) : (
              <button
                onClick={clearAllData}
                title="Wipe to clean state (0 records)"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs rounded-lg border border-slate-700 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Wipe to 0</span>
              </button>
            )}

            {/* What-If Simulator Trigger */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 font-semibold text-xs transition"
              title="Open Disaster What-If Scenario Simulator"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Simulator</span>
            </button>

            {/* Omni-Search Palette Trigger */}
            <button
              onClick={onOpenSearch}
              className="hidden lg:flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 transition"
              title="Command Search (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] text-slate-300">Search</span>
              <kbd className="text-[10px] bg-slate-950 px-1 py-0.2 rounded border border-slate-700 font-mono text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotif}
              className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Notifications & Correlated Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* RBAC User Role Badge */}
            <button
              onClick={onOpenRoleModal}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-left transition"
              title="Current User Profile & Role Permissions"
            >
              <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
                {currentUser?.role?.charAt(0) || 'C'}
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-semibold text-slate-200 leading-tight">
                  {currentUser?.name || 'Coordinator'}
                </div>
                <div className="text-[9px] text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {currentUser?.role || 'Coordinator'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Segmented Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/60 pt-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
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
                        : 'bg-slate-800 text-blue-400 border border-blue-500/30'
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

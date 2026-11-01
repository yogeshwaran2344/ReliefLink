import React from 'react';
import {
  MapPin,
  ClipboardList,
  AlertOctagon,
  Boxes,
  Truck,
  Send,
  CheckCircle2,
  Clock,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';
import { calculatePriorityScore } from '../utils/aiEstimationEngine';
import MapView from './MapView';

export default function Module1_Dashboard() {
  const { camps, warehouses, vehicles, requests, deliveries, setActiveTab, triggerAIAllocation } = useRelief();

  // Metrics calculations
  const totalLocations = camps.length;
  const activeRequests = requests.filter(r => !r.isDuplicate && r.status !== 'Delivered').length;

  const campPriorities = camps.map(c => ({
    ...c,
    priority: calculatePriorityScore(c)
  }));

  const criticalLocations = campPriorities.filter(c => c.priority.status === 'Critical').length;

  // Available stock across all 3 warehouses
  const totalAvailableStockUnits = warehouses.reduce((acc, wh) => {
    return acc + (wh.stock.food.available || 0) + (wh.stock.water.available || 0) + (wh.stock.medical.available || 0);
  }, 0);

  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;

  // Dispatched units from warehouses
  const totalDispatchedUnits = warehouses.reduce((acc, wh) => {
    return acc + (wh.stock.food.dispatched || 0) + (wh.stock.water.dispatched || 0) + (wh.stock.medical.dispatched || 0);
  }, 0);

  const deliveriesCompleted = deliveries.filter(d => d.stage === 'Completed').length;
  const pendingDeliveries = deliveries.filter(d => d.stage !== 'Completed').length;

  // Overall shortage percentage calculation
  const totalDemanded = camps.reduce((acc, c) => acc + c.demands.food + c.demands.water + c.demands.medical, 0);
  const totalReceived = camps.reduce((acc, c) => acc + (c.received?.food || 0) + (c.received?.water || 0) + (c.received?.medical || 0), 0);
  const overallShortagePercent = totalDemanded > 0 ? Math.round(((totalDemanded - totalReceived) / totalDemanded) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Live Situational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
              Module 1: Command Center
            </span>
            <span className="text-slate-400 text-xs">Synchronized with Regional Disaster Response Authority</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
            Disaster Command Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Live telemetry, situational awareness, and automated logistics orchestration across 5 affected camps, 3 strategic warehouses, and autonomous fleet routes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              triggerAIAllocation();
              setActiveTab('allocation');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/25 transition transform active:scale-95 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run AI Allocation Engine</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Exactly matching requested features */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Stat 1: Total Affected Locations */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Affected Locations</span>
            <MapPin className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalLocations}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-rose-400 font-semibold">{campPriorities.filter(c => c.priority.status === 'Critical').length} Critical</span>
            <span>in flood zone</span>
          </div>
        </div>

        {/* Stat 2: Total Active Relief Requests */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Requests</span>
            <ClipboardList className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{activeRequests}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-semibold">1 duplicate</span> suppressed
          </div>
        </div>

        {/* Stat 3: Critical Locations */}
        <div className="bg-slate-800/90 border border-rose-500/40 bg-rose-500/5 rounded-xl p-4 shadow-sm hover:border-rose-500 transition">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Locations</span>
            <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold text-rose-400">{criticalLocations}</div>
          <div className="text-[11px] text-rose-300/80 mt-1">
            Immediate assistance needed
          </div>
        </div>

        {/* Stat 4: Available Warehouse Stock */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Available Stock</span>
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalAvailableStockUnits.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Units across 3 warehouses
          </div>
        </div>

        {/* Stat 5: Available Vehicles */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Available Fleet</span>
            <Truck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{availableVehiclesCount} / {vehicles.length}</div>
          <div className="text-[11px] text-purple-300 mt-1">
            Total capacity: 2,800 kg
          </div>
        </div>

        {/* Stat 6: Supplies Dispatched */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Supplies Dispatched</span>
            <Send className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalDispatchedUnits.toLocaleString()}</div>
          <div className="text-[11px] text-sky-300 mt-1">
            Rations, water & medkits
          </div>
        </div>

        {/* Stat 7: Deliveries Completed */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Completed Drops</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{deliveriesCompleted}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified with photo proof
          </div>
        </div>

        {/* Stat 8: Pending Deliveries */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-slate-600 transition">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Deliveries</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingDeliveries}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            En route or awaiting sign-off
          </div>
        </div>

        {/* Stat 9 & 10: Overall Shortage Percentage */}
        <div className="col-span-2 bg-gradient-to-r from-slate-800 to-rose-950/40 border border-rose-500/30 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-1">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span>Overall Shortage Rate</span>
            </div>
            <div className="text-2xl font-black text-rose-400">{overallShortagePercent}%</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Demanded: {totalDemanded.toLocaleString()} | Delivered: {totalReceived.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('allocation')}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
          >
            Apportion <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Section: Live Disaster Situation Map & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Live Disaster Situation Map (5 Camps, 3 Warehouses, 3 Fleet Routes)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Interactive OpenStreetMap GIS Feed</span>
          </div>

          <MapView height="500px" />
        </div>

        {/* Right Column (1 Col): Urgent Location Triage Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Priority Triage Index</h3>
              </div>
              <button
                onClick={() => setActiveTab('priority')}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
              >
                Explain AI →
              </button>
            </div>

            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {campPriorities.sort((a, b) => b.priority.score - a.priority.score).map((camp) => (
                <div
                  key={camp.id}
                  className={`p-3 rounded-lg border bg-slate-800/80 transition hover:bg-slate-800 ${
                    camp.priority.status === 'Critical'
                      ? 'border-rose-500/50 bg-rose-500/5'
                      : camp.priority.status === 'High'
                      ? 'border-amber-500/40'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold text-xs text-white leading-tight">{camp.name}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        camp.priority.status === 'Critical'
                          ? 'bg-rose-500 text-white'
                          : camp.priority.status === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {camp.priority.score}/100 • {camp.priority.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mb-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>Pop: <b className="text-slate-200">{camp.population}</b></span>
                    <span>Injured: <b className="text-rose-300">{camp.injured}</b></span>
                    <span>Last Drop: <b className="text-slate-200">{camp.lastDeliveryHoursAgo}h ago</b></span>
                  </div>

                  <p className="text-[11px] text-slate-300 italic border-l-2 border-slate-600 pl-2">
                    {camp.priority.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-3 text-center">
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition"
            >
              <span>View all relief requests & logs</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  Sparkles,
  RefreshCw,
  Plus,
  ShieldCheck,
  Compass,
  Layers,
  ArrowRightLeft,
  Warehouse
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';
import { calculatePriorityScore } from '../utils/aiEstimationEngine';
import MapView from './MapView';

export default function Module1_Dashboard() {
  const {
    camps,
    warehouses,
    vehicles,
    requests,
    deliveries,
    userLocation,
    locationLoading,
    detectUserLocation,
    setupAroundCurrentLocation,
    clearAllData,
    setActiveTab,
    triggerAIAllocation
  } = useRelief();

  // Metrics calculations
  const totalLocations = camps.length;
  const activeRequests = requests.filter(r => !r.isDuplicate && r.status !== 'Delivered').length;

  const campPriorities = camps.map(c => ({
    ...c,
    priority: calculatePriorityScore(c)
  }));

  const criticalLocations = campPriorities.filter(c => c.priority?.status === 'Critical').length;
  const highLocations = campPriorities.filter(c => c.priority?.status === 'High').length;
  const totalPopDisplaced = camps.reduce((sum, c) => sum + (c.population || 0), 0);

  // Available stock across all warehouses
  const totalAvailableStockUnits = warehouses.reduce((acc, wh) => {
    return acc + (wh.stock?.food?.available || 0) + (wh.stock?.water?.available || 0) + (wh.stock?.medical?.available || 0) + (wh.stock?.shelter?.available || 0);
  }, 0);

  const totalDepotCapacityKg = warehouses.reduce((acc, wh) => acc + (wh.capacityKg || 0), 0);
  const totalFleetCapacityKg = vehicles.reduce((acc, v) => acc + (v.maxCapacityKg || 0), 0);
  const availableVehiclesCount = vehicles.filter(v => v.status === 'Available').length;

  const deliveriesCompleted = deliveries.filter(d => d.stage === 'Completed').length;
  const pendingDeliveries = deliveries.filter(d => d.stage !== 'Completed').length;

  // Demand & Fulfillment percentages
  const totalDemanded = camps.reduce((acc, c) => acc + (c.demands?.food || 0) + (c.demands?.water || 0) + (c.demands?.medical || 0) + (c.demands?.shelter || 0), 0);
  const totalReceived = camps.reduce((acc, c) => acc + (c.received?.food || 0) + (c.received?.water || 0) + (c.received?.medical || 0) + (c.received?.shelter || 0), 0);
  const overallShortagePercent = totalDemanded > 0 ? Math.round(((totalDemanded - totalReceived) / totalDemanded) * 100) : 0;
  const overallFulfillmentPercent = totalDemanded > 0 ? Math.min(100, Math.round((totalReceived / totalDemanded) * 100)) : 100;

  return (
    <div className="space-y-6">
      {/* Hero Operations Control Bar */}
      <div className="glass-panel rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                Emergency Operations Center (EOC)
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">
                • Real-time Disaster Telemetry
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Disaster Logistics Command Center
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {totalLocations === 0
                ? 'System initialized in Clean Slate mode. Ready for live field GPS intake or instant baseline simulation.'
                : `Active operations sector coordinating ${totalLocations} camps, ${warehouses.length} supply depots, and ${vehicles.length} vehicle fleets.`}
            </p>
          </div>

          {/* Quick Context Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {totalLocations === 0 ? (
              <>
                <button
                  onClick={() => setupAroundCurrentLocation(userLocation?.lat, userLocation?.lng)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition transform active:scale-95 text-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>⚡ Deploy Grid at My GPS</span>
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition text-xs"
                >
                  <Plus className="w-4 h-4 text-rose-400" />
                  <span>Register First Camp</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    triggerAIAllocation();
                    setActiveTab('allocation');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition transform active:scale-95 text-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Allocation Engine</span>
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition text-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                  <span>New Request</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 5 Balanced Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Affected Sectors */}
        <div className="glass-panel rounded-xl p-4 shadow-sm hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Affected Sites</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalLocations}</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className={criticalLocations > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
              {criticalLocations} Critical
            </span>
            <span>• {highLocations} High Urgency</span>
          </div>
        </div>

        {/* Card 2: Active Demands */}
        <div className="glass-panel rounded-xl p-4 shadow-sm hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Demanded Supplies</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalDemanded.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-amber-400 font-semibold">{activeRequests}</span> active requests submitted
          </div>
        </div>

        {/* Card 3: Depot Stock Reserves */}
        <div className="glass-panel rounded-xl p-4 shadow-sm hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Depot Reserves</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalAvailableStockUnits.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {warehouses.length > 0 ? `Stocked in ${warehouses.length} regional depots` : '0 Depots registered'}
          </div>
        </div>

        {/* Card 4: Fleet Availability */}
        <div className="glass-panel rounded-xl p-4 shadow-sm hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fleet Convoys</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{availableVehiclesCount} / {vehicles.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalFleetCapacityKg > 0 ? `${totalFleetCapacityKg.toLocaleString()} kg max payload` : '0 kg capacity'}
          </div>
        </div>

        {/* Card 5: Overall Shortage & Fulfillment */}
        <div className="glass-panel rounded-xl p-4 shadow-sm hover:border-slate-700 transition group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Fulfillment Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{overallFulfillmentPercent}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalReceived.toLocaleString()} units delivered ({deliveriesCompleted} drops)
          </div>
        </div>
      </div>

      {/* Main Section: Interactive GIS Map & Priority Triage Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Live Map View */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Real-Time GIS Operations Map
              </h2>
              <span className="text-xs text-slate-400 hidden sm:inline">
                ({totalLocations} Camps • {warehouses.length} Depots • {vehicles.length} Fleet)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300 font-mono bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/80 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>
                  {userLocation ? `GPS: ${userLocation.lat}, ${userLocation.lng} (±${userLocation.accuracy}m)` : 'Locating GPS...'}
                </span>
              </span>
              <button
                onClick={detectUserLocation}
                disabled={locationLoading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                title="Refresh Real-Time GPS Coordinates"
              >
                <Compass className={`w-3.5 h-3.5 text-blue-400 ${locationLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <MapView height="520px" />
        </div>

        {/* Right Column (1 Col): Priority Triage & Allocation Queue */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between shadow-2xl border border-slate-800">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Priority Triage Index
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('priority')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Explain AI</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {camps.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-300">No Camps Registered Yet</div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Click below to initialize baseline sectors around your GPS location.
                </p>
                <button
                  onClick={() => setupAroundCurrentLocation(userLocation?.lat, userLocation?.lng)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow"
                >
                  ⚡ Setup at My GPS
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {campPriorities.sort((a, b) => b.priority.score - a.priority.score).map((camp) => (
                  <div
                    key={camp.id}
                    onClick={() => setActiveTab('priority')}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      camp.priority.status === 'Critical'
                        ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500/60'
                        : camp.priority.status === 'High'
                        ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
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

                    <div className="text-[11px] text-slate-400 mb-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>Pop: <b className="text-slate-200">{camp.population?.toLocaleString()}</b></span>
                      <span>Injured: <b className="text-rose-400">{camp.injured}</b></span>
                      <span>Demands: <b className="text-slate-200">{(camp.demands?.food || 0) + (camp.demands?.water || 0)} units</b></span>
                    </div>

                    <p className="text-[11px] text-slate-300 italic border-l border-slate-700 pl-2">
                      "{camp.priority.explanation}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">8 life-critical triage factors</span>
            <button
              onClick={() => setActiveTab('allocation')}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>View Allocations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Row: Live Pipeline & Inter-Depot Balancing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Live Delivery Mission Tracking */}
        <div className="glass-panel rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Fleet Convoys & Transit Pipeline
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('tracking')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Audit Proof</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {deliveries.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No active vehicle convoys in pipeline. Approve an allocation in Module 5 to generate dispatch missions.
            </div>
          ) : (
            <div className="space-y-3">
              {deliveries.slice(0, 3).map(del => (
                <div key={del.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{del.deliveryCode}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                        {del.stage}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {del.warehouseName} ➔ <b className="text-slate-200">{del.targetLocationName}</b>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <span className="text-slate-400 block">{del.vehicleName}</span>
                    <span className="text-emerald-400 font-bold">{del.dispatchedQuantities?.food || 0} Food • {del.dispatchedQuantities?.water || 0}L Water</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel 2: Strategic Depot Reserves & Balancing */}
        <div className="glass-panel rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Strategic Depot Inventory Buffer
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Depots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {warehouses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No strategic supply depots registered. Click 'Setup at My GPS' above to provision regional warehouses.
            </div>
          ) : (
            <div className="space-y-3">
              {warehouses.map(wh => (
                <div key={wh.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{wh.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">Capacity: {wh.capacityKg?.toLocaleString()} kg</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-950/80 p-2 rounded-lg border border-slate-800 font-mono">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Food</span>
                      <b className="text-emerald-400">{wh.stock?.food?.available?.toLocaleString() || 0} pkts</b>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Water</span>
                      <b className="text-sky-400">{wh.stock?.water?.available?.toLocaleString() || 0} L</b>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Trauma</span>
                      <b className="text-rose-400">{wh.stock?.medical?.available?.toLocaleString() || 0} kits</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Route,
  Navigation,
  ShieldCheck,
  Clock,
  MapPin,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Compass
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';
import { optimizeVehicleRoutes } from '../utils/routingOptimizer';

export default function Module6_RouteOptimization() {
  const { vehicles, warehouses, allocationOutput, blockages, toggleBlockage, setActiveTab } = useRelief();

  // Run Capacitated Vehicle Routing optimization based on allocation plan
  const plan = allocationOutput?.allocationPlan || [];
  const optimizedFleet = optimizeVehicleRoutes(vehicles, plan, warehouses, blockages);

  const activeHazard = blockages.some(b => b.active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
              Module 6: Fleet Logistics
            </span>
            <span className="text-slate-400 text-xs">Google OR-Tools CVRP Vehicle Routing Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Smart Vehicle & Route Optimization
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Multi-drop route sequence optimization with strict payload enforcement, dynamic hazard rerouting, and real-time travel time estimation.
          </p>
        </div>

        {/* Hazard Simulation Toggle */}
        <button
          onClick={() => toggleBlockage('blk-1')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
            activeHazard
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 ring-2 ring-amber-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-300" />
          <span>{activeHazard ? 'Hazard Active: Highway 4 Blocked' : 'Simulate Road Blockage'}</span>
        </button>
      </div>

      {/* Capacity Safeguard Banner */}
      <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-emerald-300 uppercase tracking-wide">
              Capacity Safeguard Guarantee (OR-Tools Constraint)
            </div>
            <div className="text-slate-300 mt-0.5">
              The routing optimizer enforces strict payload inequality: <code className="text-emerald-400 font-mono">Load(v) ≤ MaxCapacity(v)</code>. If Van RL-03 has a 500 kg limit, the system guarantees 0% overflow risk by dividing demands across the fleet.
            </div>
          </div>
        </div>

        <span className="shrink-0 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px] border border-emerald-500/30">
          Strict 0% Overload
        </span>
      </div>

      {/* Road Blockage Simulation Card (When Active) */}
      {activeHazard && (
        <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
              <h3 className="font-bold text-amber-200 text-sm">
                Active Route Hazard: Highway 4 Western Bypass Blocked by Mudslide
              </h3>
            </div>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
              Detour Recalculation Enacted
            </span>
          </div>

          <p className="text-xs text-slate-300">
            The automated routing solver detected that the primary arterial road to Camp A and Camp E is submerged. Travel routes have been dynamically diverted via the Eastern Link Expressway Detour (+7.4 km, +45 mins).
          </p>
        </div>
      )}

      {/* Fleet Vehicles Grid */}
      {optimizedFleet.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Truck className="w-8 h-8 text-purple-400 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-white">No Vehicles Assigned (Clean Slate)</h3>
          <p className="text-xs text-slate-400">Initialize a cluster around your GPS to assign vehicle fleets and optimize multi-drop delivery routes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {optimizedFleet.map(veh => {
            const originWarehouse = warehouses.find(w => w.id === veh.currentWarehouseId) || warehouses[0] || { name: 'Regional Central Depot' };
            const loadPercent = Math.round((veh.currentLoadKg / veh.maxCapacityKg) * 100);
            const isOverloaded = veh.currentLoadKg > veh.maxCapacityKg;

          return (
            <div key={veh.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              <div>
                {/* Vehicle Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-400" />
                      <h3 className="font-bold text-white text-sm">{veh.name}</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {veh.regNumber} • {veh.type}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                    {veh.status}
                  </span>
                </div>

                {/* Assigned Base & Driver */}
                <div className="text-xs space-y-1 text-slate-400 mb-3 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60">
                  <div>Home Depot: <b className="text-slate-200">{originWarehouse.name}</b></div>
                  <div>Driver: <b className="text-slate-200">{veh.driverName}</b> ({veh.driverPhone})</div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 mb-4 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold">Capacity Envelope:</span>
                    <span className="font-mono">
                      <b className={isOverloaded ? 'text-rose-400' : 'text-purple-300'}>{veh.currentLoadKg}</b> / {veh.maxCapacityKg} kg ({loadPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverloaded
                          ? 'bg-rose-500'
                          : loadPercent > 80
                          ? 'bg-purple-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(loadPercent, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>Cargo: 🍞 {veh.cargoBreakdown.food} pkts</span>
                    <span>💧 {veh.cargoBreakdown.water} L</span>
                    <span>🩹 {veh.cargoBreakdown.medical} kits</span>
                  </div>
                </div>

                {/* Route Sequencing & Multi-Stop Delivery Plan */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1">
                      <Route className="w-3.5 h-3.5 text-purple-400" />
                      Assigned Stops:
                    </span>
                    <span>{veh.assignedStops.length} locations</span>
                  </div>

                  {veh.assignedStops.length === 0 ? (
                    <div className="p-3 bg-slate-800/40 rounded-lg text-slate-400 text-center text-xs">
                      No stops currently queued for this vehicle.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {veh.assignedStops.map((stop, sIdx) => (
                        <div key={stop.campId} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center">
                              {sIdx + 1}
                            </span>
                            <div>
                              <div className="font-semibold text-white text-[11px]">{stop.campName}</div>
                              <div className="text-[10px] text-slate-400">
                                Drop: {stop.weightKg} kg (🍞 {stop.food}, 💧 {stop.water})
                              </div>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            stop.priorityStatus === 'Critical' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {stop.priorityScore}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Transit Distance & Estimated Arrival */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">Round-Trip Distance:</div>
                  <div className="font-bold text-white font-mono">{veh.estimatedDistanceKm} km</div>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Estimated Mission Time:</div>
                  <div className={`font-bold font-mono ${veh.hasBlockageImpact ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {veh.estimatedMinutes} mins {veh.hasBlockageImpact && '(+Detour)'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

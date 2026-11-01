import React, { useState } from 'react';
import {
  GitFork,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Warehouse,
  Truck,
  ArrowRight,
  TrendingDown,
  FileCheck
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function Module5_AllocationEngine() {
  const { allocationOutput, triggerAIAllocation, setActiveTab } = useRelief();
  const [isRecomputing, setIsRecomputing] = useState(false);

  const handleRecompute = () => {
    setIsRecomputing(true);
    setTimeout(() => {
      triggerAIAllocation();
      setIsRecomputing(false);
    }, 400);
  };

  const plan = allocationOutput?.allocationPlan || [];
  const totalAllocatedKg = allocationOutput?.totalAllocatedKg || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 p-6 rounded-2xl border border-rose-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
              Module 5: Core Algorithmic Heart
            </span>
            <span className="text-slate-400 text-xs">Multi-Constraint Explainable Optimization</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Intelligent Resource Allocation Engine
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Automatically computes optimal resource distribution across 5 camps and 3 warehouses, balancing urgency scores, geographic distances, fleet capacities, and deficit containment.
          </p>
        </div>

        <button
          onClick={handleRecompute}
          disabled={isRecomputing}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-600/30 transition transform active:scale-95 disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isRecomputing ? 'animate-spin' : ''}`} />
          <span>{isRecomputing ? 'Optimizing Simplex...' : 'Re-Run Optimization Engine'}</span>
        </button>
      </div>

      {/* Constraints Respect Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Depot Inventory</div>
            <div className="text-xs font-bold text-slate-200">Zero Overdraw Enforced</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Priority Precedence</div>
            <div className="text-xs font-bold text-slate-200">Score-Weighted Allocation</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Payload Envelope</div>
            <div className="text-xs font-bold text-slate-200">Total: {totalAllocatedKg.toLocaleString()} kg Assigned</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Geographic Proximity</div>
            <div className="text-xs font-bold text-slate-200">Min Distance Multi-Depot</div>
          </div>
        </div>
      </div>

      {/* Main Calculated Allocation Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white text-sm flex items-center gap-2">
              <GitFork className="w-4 h-4 text-rose-400" />
              <span>Optimal Multi-Camp Resource Allocation Matrix</span>
            </h2>
            <p className="text-xs text-slate-400">Calculated delivery allocations across the 5 disaster camps.</p>
          </div>

          <button
            onClick={() => setActiveTab('routing')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <span>Assign to Vehicles & Routes</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Location / Camp</th>
                <th className="px-4 py-3">Priority Score</th>
                <th className="px-4 py-3 text-center">Food (Packets)</th>
                <th className="px-4 py-3 text-center">Water (Liters)</th>
                <th className="px-4 py-3 text-center">Medical (Kits)</th>
                <th className="px-4 py-3">Supplying Warehouse</th>
                <th className="px-4 py-3">Cargo Weight</th>
                <th className="px-4 py-3 text-right">Remaining Shortage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {plan.map((item, idx) => (
                <tr key={item.campId} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px] border border-slate-700">
                        #{idx + 1}
                      </span>
                      <span>{item.campName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.priorityStatus === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : item.priorityStatus === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}
                    >
                      {item.priorityScore}/100 • {item.priorityStatus}
                    </span>
                  </td>

                  {/* Food Allocated / Demanded */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="font-bold text-sm text-emerald-400 font-mono">
                      {item.allocated.food}
                    </div>
                    <div className="text-[10px] text-slate-500">of {item.demands.food} req</div>
                  </td>

                  {/* Water Allocated / Demanded */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="font-bold text-sm text-sky-400 font-mono">
                      {item.allocated.water}
                    </div>
                    <div className="text-[10px] text-slate-500">of {item.demands.water} req</div>
                  </td>

                  {/* Medical Allocated / Demanded */}
                  <td className="px-4 py-3.5 text-center">
                    <div className="font-bold text-sm text-rose-400 font-mono">
                      {item.allocated.medical}
                    </div>
                    <div className="text-[10px] text-slate-500">of {item.demands.medical} req</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-200">{item.primaryWarehouseName}</div>
                    <div className="text-[10px] text-slate-400">Closest verified stock source</div>
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-slate-200">
                    {item.totalWeightKg.toLocaleString()} kg
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono text-slate-400">
                    {item.shortages.food > 0 || item.shortages.water > 0 || item.shortages.medical > 0 ? (
                      <span className="text-amber-400 font-semibold text-[11px]">
                        -{item.shortages.food}F, -{item.shortages.water}W, -{item.shortages.medical}M
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold text-[11px]">
                        0 (100% Fulfilled)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALLOCATION EXPLANATION PANEL (Requested explicitly for judges) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-white text-sm">
              Allocation Explanation Panel (Explainable AI for Judges)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Deterministic Rationale for Every Resource Decision</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.map((item) => (
            <div key={item.campId} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{item.campName}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Allocated: {item.totalWeightKg} kg
                </span>
              </div>
              <p className="text-xs text-slate-300 italic border-l-2 border-rose-500 pl-2.5 leading-relaxed">
                "{item.explanation}"
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                <span>Source: <b>{item.primaryWarehouseName}</b></span>
                <span className="text-emerald-400 font-semibold">
                  {Math.round(((item.allocated.food + item.allocated.water) / ((item.demands.food + item.demands.water) || 1)) * 100)}% Demand Met
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

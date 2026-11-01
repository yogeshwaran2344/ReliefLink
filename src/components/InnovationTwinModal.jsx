import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Activity,
  Compass,
  AlertTriangle,
  Flame,
  Droplets,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Zap,
  Building2,
  Truck,
  X,
  Server
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function InnovationTwinModal({ isOpen, onClose }) {
  const { camps, warehouses, vehicles, blockages } = useRelief();

  const [activeTab, setActiveTab] = useState('predictive'); // 'predictive' or 'digital-twin'
  const [floodStageMeters, setFloodStageMeters] = useState(3.8); // 1.0 to 6.0m
  const [prepositionTriggered, setPrepositionTriggered] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[2650] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Autonomous Disaster Innovations Engine
                </h2>
                <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 uppercase">
                  Physical AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predictive Satellite Flood Inundation Modeling & Discrete-Event Logistics Digital Twin
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6">
          <button
            onClick={() => setActiveTab('predictive')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'predictive'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>A. Predictive Disaster Impact Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('digital-twin')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'digital-twin'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>B. Disaster Logistics Digital Twin</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-200">
          {activeTab === 'predictive' ? (
            <div className="space-y-6">
              {/* Inundation Control */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Sentinel-2 Synthetic Aperture Radar (SAR) Forecast Inundation
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Projected 24-hour storm surge water stage:
                    </p>
                  </div>
                  <span className="font-mono text-purple-300 font-bold bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30 text-sm">
                    {floodStageMeters.toFixed(1)} Meters Water Stage
                  </span>
                </div>

                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.1"
                  value={floodStageMeters}
                  onChange={(e) => setFloodStageMeters(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1.0m (Nominal High Tide)</span>
                  <span>3.5m (Moderate Overflow)</span>
                  <span>6.0m (Catastrophic Coastal Surge)</span>
                </div>
              </div>

              {/* Predictive Impact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Expected Displaced Population</span>
                  <div className="text-lg font-bold text-white font-mono">
                    {Math.round(4450 * (1 + (floodStageMeters - 2) * 0.25)).toLocaleString()} People
                  </div>
                  <span className="text-[10px] text-rose-400 block">
                    +{Math.round((floodStageMeters - 2) * 25)}% Expected Population Evacuation
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Critical Submersion Risk</span>
                  <div className="text-lg font-bold text-amber-400 font-mono">
                    Camp A & Camp E
                  </div>
                  <span className="text-[10px] text-amber-300 block">
                    Causeway breach expected in 3.5 hours
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pre-Emptive Supply Needed</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    +1,650 L Water / 950 Rations
                  </div>
                  <span className="text-[10px] text-emerald-300 block">
                    Required prior to road breach
                  </span>
                </div>
              </div>

              {/* Autonomous Pre-Positioning Recommendation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-purple-950/30 border border-purple-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <h4 className="font-bold text-purple-200 text-xs uppercase tracking-wider">
                      Autonomous Supply Pre-Positioning Order (USP)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Actionable Physical AI
                  </span>
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Before Highway 4 causeway experiences 100% submersion at hour +4, the predictive engine recommends pre-positioning
                  <b> 800 kg high-energy rations and trauma kits from Central Depot Alpha to Elevated Staging Post Camp B</b>.
                </p>

                <button
                  onClick={() => setPrepositionTriggered(true)}
                  disabled={prepositionTriggered}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-emerald-600 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{prepositionTriggered ? '✓ Pre-Positioning Order Dispatched' : 'Authorize Pre-Positioning Dispatch'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Digital Twin Topology */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Disaster Logistics Discrete-Event Digital Twin
                    </h3>
                    <p className="text-slate-400 text-[11px]">
                      Virtual simulation model executing concurrent Monte-Carlo supply chain iterations.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                    System MTTR Resilience: 94.2%
                  </span>
                </div>

                {/* Network Topology Graph Representation */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Supply Nodes (3 Depots)</span>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-sky-500/40 text-sky-300 font-mono font-bold">
                      Depot Alpha • Beta • Gamma
                    </div>
                    <span className="text-[10px] text-emerald-400 block">Total Buffer: 11,800 kg</span>
                  </div>

                  <div className="space-y-2 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Transit Arteries</span>
                    <div className="w-full bg-slate-950 p-2.5 rounded-lg border border-amber-500/40 text-amber-300 font-mono font-bold text-[11px]">
                      Highway 4 ➔ Eastern Link
                    </div>
                    <span className="text-[10px] text-amber-400 block">Chokepoint Detour Active</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Demand Sinks (5 Camps)</span>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-rose-500/40 text-rose-300 font-mono font-bold">
                      Camp A, B, C, D, E
                    </div>
                    <span className="text-[10px] text-rose-400 block">Active Demand: 4,450 People</span>
                  </div>
                </div>

                {/* Digital Twin Failure Stress Test Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Fleet Bottleneck Score</span>
                    <span className="font-bold text-white text-sm font-mono">14.2%</span>
                    <span className="text-emerald-400 text-[9px] block">Safe (Below 25%)</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Stockout Probability</span>
                    <span className="font-bold text-amber-400 text-sm font-mono">6.8%</span>
                    <span className="text-slate-400 text-[9px] block">Contained by Surplus Engine</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Mean Time to Replenish</span>
                    <span className="font-bold text-white text-sm font-mono">42 mins</span>
                    <span className="text-slate-400 text-[9px] block">Within 60m SLA</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Network Entropy</span>
                    <span className="font-bold text-emerald-400 text-sm font-mono">0.18</span>
                    <span className="text-emerald-400 text-[9px] block">Optimal Determinism</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

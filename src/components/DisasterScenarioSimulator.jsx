import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  AlertTriangle,
  Flame,
  Truck,
  Droplets,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Zap,
  Users
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function DisasterScenarioSimulator({ isOpen, onClose }) {
  const {
    camps,
    warehouses,
    vehicles,
    blockages,
    applySimulationScenario,
    resetDemoData,
    addToast
  } = useRelief();

  // Local state for scenario parameters
  const [severity, setSeverity] = useState('Severe'); // 'Moderate', 'Severe', 'Extreme'
  const [popMultiplier, setPopMultiplier] = useState(1.2); // 1.0 to 2.5
  const [blockHighway, setBlockHighway] = useState(false);
  const [brokenVehicleId, setBrokenVehicleId] = useState('none'); // 'none', 'veh-1', 'veh-2', 'veh-3'
  const [depleteWarehouseWater, setDepleteWarehouseWater] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  if (!isOpen) return null;

  // Preset scenarios for judges
  const presets = [
    {
      id: 'p1',
      title: 'Preset 1: Midnight Flash Flood Surge',
      desc: 'Severe rainfall inundates riverbank camps, population swells by +40%, and water reserves drop sharply.',
      config: {
        severity: 'Extreme',
        popMultiplier: 1.4,
        blockHighway: true,
        brokenVehicleId: 'none',
        depleteWarehouseWater: false
      }
    },
    {
      id: 'p2',
      title: 'Preset 2: Mountain Mudslide & Fleet Breakdown',
      desc: 'Highway 4 blocked by debris; All-Terrain Truck RL-02 suffers transmission failure in transit.',
      config: {
        severity: 'Severe',
        popMultiplier: 1.1,
        blockHighway: true,
        brokenVehicleId: 'veh-2',
        depleteWarehouseWater: false
      }
    },
    {
      id: 'p3',
      title: 'Preset 3: Acute Regional Water Crisis',
      desc: 'Northern Hub water supply compromised; requires emergency surplus reallocation from Central Depot.',
      config: {
        severity: 'Severe',
        popMultiplier: 1.0,
        blockHighway: false,
        brokenVehicleId: 'none',
        depleteWarehouseWater: true
      }
    }
  ];

  const handleApplyPreset = (preset) => {
    setActivePreset(preset.id);
    setSeverity(preset.config.severity);
    setPopMultiplier(preset.config.popMultiplier);
    setBlockHighway(preset.config.blockHighway);
    setBrokenVehicleId(preset.config.brokenVehicleId);
    setDepleteWarehouseWater(preset.config.depleteWarehouseWater);
  };

  const handleRunSimulation = () => {
    applySimulationScenario({
      severity,
      popMultiplier,
      blockHighway,
      brokenVehicleId,
      depleteWarehouseWater
    });

    addToast('warning', `Disaster Simulation Enacted: [${severity} Severity, ${(popMultiplier * 100).toFixed(0)}% Pop Scale]. All 8 modules recomputed!`, 'Scenario Live');
    if (onClose) onClose();
  };

  const handleReset = () => {
    resetDemoData();
    setSeverity('Severe');
    setPopMultiplier(1.0);
    setBlockHighway(false);
    setBrokenVehicleId('none');
    setDepleteWarehouseWater(false);
    setActivePreset(null);
    addToast('info', 'Operational grid restored to baseline 5 camps, 3 warehouses, 3 vehicles.', 'Reset Complete');
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-[3000] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl p-6 space-y-6 my-8" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/40">
                  Judges' Interactive Sandbox
                </span>
                <span className="text-xs text-slate-400">Physical AI Dynamic Stress-Testing</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                What-If Disaster Scenario Simulator
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Quick Presets for Demo */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Instant Scenario Presets for Presentations:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presets.map(p => (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  activePreset === p.id
                    ? 'bg-indigo-950/60 border-indigo-400 ring-1 ring-indigo-400'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="font-bold text-xs text-white mb-1">{p.title}</div>
                <p className="text-[11px] text-slate-300 leading-snug">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Custom Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
          {/* Parameter 1: Disaster Severity */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>1. Regional Disaster Severity</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Moderate', 'Severe', 'Extreme'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`py-2 rounded-lg font-bold text-xs transition ${
                    severity === level
                      ? level === 'Extreme'
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                        : level === 'Severe'
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Directly influences algorithm casualty surge factor and camp priority index weighting.
            </span>
          </div>

          {/* Parameter 2: Population Surge */}
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" />
                2. Evacuee Population Surge Factor
              </span>
              <span className="text-indigo-400 font-mono">{(popMultiplier * 100).toFixed(0)}% (x{popMultiplier.toFixed(1)})</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.2"
              step="0.1"
              value={popMultiplier}
              onChange={e => setPopMultiplier(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Baseline (100%)</span>
              <span>Moderate (+50%)</span>
              <span>Crisis Spike (+120%)</span>
            </div>
          </div>

          {/* Parameter 3: Infrastructure Hazard (Road Blockage) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>3. Route Arterial Infrastructure</span>
            </label>
            <button
              type="button"
              onClick={() => setBlockHighway(!blockHighway)}
              className={`w-full py-2.5 px-3 rounded-lg border font-semibold flex items-center justify-between transition ${
                blockHighway
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>Highway 4 Bypass Flooded (Near Mile 14)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                blockHighway ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'
              }`}>
                {blockHighway ? 'Blocked (+7.4 km Detour)' : 'Clear'}
              </span>
            </button>
          </div>

          {/* Parameter 4: Vehicle Fleet Status */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-purple-400" />
              <span>4. Fleet Readiness & Breakdowns</span>
            </label>
            <select
              value={brokenVehicleId}
              onChange={e => setBrokenVehicleId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
            >
              <option value="none">All 3 Vehicles Fully Operational (2,800 kg total)</option>
              <option value="veh-2">Simulate Breakdown: Off-Road Truck RL-02 (Offline)</option>
              <option value="veh-3">Simulate Breakdown: Transit Van RL-03 (Offline)</option>
              <option value="veh-1">Simulate Breakdown: Heavy Truck RL-01 (Offline)</option>
            </select>
            <span className="text-[10px] text-slate-400 block">
              Tests algorithmic redistribution of payload to remaining available fleet units without capacity overflow.
            </span>
          </div>

          {/* Parameter 5: Depot Depletion */}
          <div className="md:col-span-2 space-y-2 pt-2 border-t border-slate-800">
            <label className="font-bold text-slate-200 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span>5. Depot Stockout Stress-Test</span>
            </label>
            <button
              type="button"
              onClick={() => setDepleteWarehouseWater(!depleteWarehouseWater)}
              className={`w-full py-2.5 px-3 rounded-lg border font-semibold flex items-center justify-between transition ${
                depleteWarehouseWater
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <span>Warehouse B (Northern Relief Base) Running Out of Drinking Water</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                depleteWarehouseWater ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {depleteWarehouseWater ? 'Water Buffer Critical (0 L)' : 'Stock Nominal'}
              </span>
            </button>
          </div>
        </div>

        {/* Expected System Response Telemetry */}
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
          <span className="font-bold text-indigo-400 uppercase tracking-wide text-[11px] block">
            System Algorithmic Reaction Pipeline:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Priority Score:</span>
              <b className={severity === 'Extreme' ? 'text-rose-400' : 'text-amber-400'}>
                {severity === 'Extreme' ? '▲ Surges to 99' : 'Recalculated'}
              </b>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Supply Demand:</span>
              <b className="text-blue-400">
                +{(popMultiplier * 100 - 100).toFixed(0)}% Rations Needed
              </b>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Fleet Capacity:</span>
              <b className={brokenVehicleId !== 'none' ? 'text-rose-400' : 'text-emerald-400'}>
                {brokenVehicleId !== 'none' ? 'Auto-Reassigned' : '0% Overload Safe'}
              </b>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Route Detour:</span>
              <b className={blockHighway ? 'text-amber-400' : 'text-slate-300'}>
                {blockHighway ? '+7.4 km Bypass' : 'Direct Corridors'}
              </b>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation Baseline</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRunSimulation}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-rose-600 to-amber-600 hover:from-indigo-500 hover:to-amber-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Run Disaster Simulation & Recalculate All Modules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

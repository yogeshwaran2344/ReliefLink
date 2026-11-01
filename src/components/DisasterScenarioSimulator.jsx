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
  Users,
  Building2,
  BookmarkPlus,
  Save,
  Clock,
  Layers,
  Scale
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
  const [popMultiplier, setPopMultiplier] = useState(1.4); // 1.0 to 2.5
  const [blockHighway, setBlockHighway] = useState(true);
  const [offlineWarehouse, setOfflineWarehouse] = useState('none'); // 'none', 'wh-1', 'wh-2', 'wh-3'
  const [brokenVehicleId, setBrokenVehicleId] = useState('none'); // 'none', 'veh-1', 'veh-2', 'veh-3'
  const [depleteWarehouseWater, setDepleteWarehouseWater] = useState(true);

  // Simulation execution state
  const [isSimulated, setIsSimulated] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState([
    {
      id: 'sc-1',
      title: 'Midnight Flash Flood Surge',
      timestamp: 'Today at 14:30',
      popMultiplier: 1.4,
      varianceSummary: '+40% Population, +30% Deficit, +24 mins ETA'
    }
  ]);

  if (!isOpen) return null;

  // Preset scenarios for ideathon presentation
  const presets = [
    {
      id: 'p1',
      title: 'Preset 1: Midnight Flash Flood Surge',
      desc: 'Severe rainfall inundates riverbank camps, population swells by +40%, and water reserves drop sharply.',
      config: {
        severity: 'Extreme',
        popMultiplier: 1.4,
        blockHighway: true,
        offlineWarehouse: 'none',
        brokenVehicleId: 'none',
        depleteWarehouseWater: true
      }
    },
    {
      id: 'p2',
      title: 'Preset 2: Arterial Logistics Chokepoint',
      desc: 'Highway 4 Western Bypass bridge collapses; heavy truck RL-01 suffers axle breakdown during transit.',
      config: {
        severity: 'Severe',
        popMultiplier: 1.2,
        blockHighway: true,
        offlineWarehouse: 'none',
        brokenVehicleId: 'veh-1',
        depleteWarehouseWater: false
      }
    },
    {
      id: 'p3',
      title: 'Preset 3: Central Depot Flooding Catastrophe',
      desc: 'Central Depot Alpha is submerged and rendered offline; all allocations must shift to Depot Beta and Gamma.',
      config: {
        severity: 'Extreme',
        popMultiplier: 1.5,
        blockHighway: true,
        offlineWarehouse: 'wh-1',
        brokenVehicleId: 'veh-2',
        depleteWarehouseWater: true
      }
    }
  ];

  const handleApplyPreset = (p) => {
    setSeverity(p.config.severity);
    setPopMultiplier(p.config.popMultiplier);
    setBlockHighway(p.config.blockHighway);
    setOfflineWarehouse(p.config.offlineWarehouse);
    setBrokenVehicleId(p.config.brokenVehicleId);
    setDepleteWarehouseWater(p.config.depleteWarehouseWater);
  };

  const handleRunSimulation = () => {
    applySimulationScenario({
      severity,
      popMultiplier,
      blockHighway,
      offlineWarehouse,
      brokenVehicleId,
      depleteWarehouseWater
    });
    setIsSimulated(true);
    addToast('warning', 'What-If Disaster Simulation executed. Side-by-side variance analysis generated.', 'Simulation Active');
  };

  const handleSaveScenario = () => {
    const newSc = {
      id: `sc-${Date.now()}`,
      title: `Scenario: ${severity} Surge (Pop x${popMultiplier})`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      popMultiplier,
      varianceSummary: `Severity ${severity}, Road Blocked: ${blockHighway ? 'Yes' : 'No'}, Offline Depot: ${offlineWarehouse}`
    };
    setSavedScenarios(prev => [newSc, ...prev]);
    addToast('success', 'Simulation scenario saved to presentation briefing gallery.', 'Scenario Saved');
  };

  const handleResetToBaseline = () => {
    resetDemoData();
    setIsSimulated(false);
    addToast('info', 'Reset to baseline standard operational disaster state (5 Camps / 3 Warehouses / 3 Vehicles).', 'Reset Complete');
  };

  // Comparative Metrics calculation
  const basePop = 4450;
  const simPop = Math.round(basePop * popMultiplier);
  const baseShortage = 18;
  const simShortage = Math.min(85, Math.round(baseShortage * popMultiplier * (depleteWarehouseWater ? 1.6 : 1.2)));
  const baseLatency = 28;
  const simLatency = baseLatency + (blockHighway ? 24 : 0) + (offlineWarehouse !== 'none' ? 18 : 0);
  const baseCritCamps = 2;
  const simCritCamps = severity === 'Extreme' ? 4 : 3;

  return (
    <div className="fixed inset-0 bg-black/80 z-[2700] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-rose-500 text-white rounded-xl shadow-lg shadow-amber-500/20">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Disaster Response What-If Engine
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                  Multi-Factor Stress Test
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stress-test the autonomous logistics engine under catastrophic multi-variable conditions without altering live production databases.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-200">
          {/* Quick Presets for Ideathon Judges */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              ⚡ Instant Stress-Test Presets (Judges Demonstration):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleApplyPreset(p)}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition text-left group"
                >
                  <div className="font-bold text-white group-hover:text-amber-400 text-xs">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Multi-Factor Sliders & Toggles */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Scenario Control Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Population Multiplier */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" /> Displaced Population Surge:
                  </span>
                  <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    +{Math.round((popMultiplier - 1.0) * 100)}% ({simPop.toLocaleString()} people)
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={popMultiplier}
                  onChange={(e) => setPopMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Disaster Severity */}
              <div>
                <span className="text-slate-300 font-semibold block mb-1.5">
                  Incident Weather Severity:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['Moderate', 'Severe', 'Extreme'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSeverity(lvl)}
                      className={`py-1.5 rounded-lg font-bold text-xs transition ${
                        severity === lvl
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Road Hazard Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Highway 4 Causeway Blockage</span>
                  <span className="text-[10px] text-slate-400">Forces OR-Tools detour via Eastern Link (+7.4 km)</span>
                </div>
                <input
                  type="checkbox"
                  checked={blockHighway}
                  onChange={(e) => setBlockHighway(e.target.checked)}
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              {/* Deplete Water Supplies */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Regional Potable Water Deficit</span>
                  <span className="text-[10px] text-slate-400">Simulate -60% drop in depot drinking water reserves</span>
                </div>
                <input
                  type="checkbox"
                  checked={depleteWarehouseWater}
                  onChange={(e) => setDepleteWarehouseWater(e.target.checked)}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {/* Warehouse Failure */}
              <div>
                <span className="text-slate-300 font-semibold block mb-1">Simulate Warehouse Failure:</span>
                <select
                  value={offlineWarehouse}
                  onChange={(e) => setOfflineWarehouse(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="none">{warehouses.length === 0 ? 'No Warehouses Registered' : 'All Warehouses Fully Operational'}</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} Offline (Depot Flooding)</option>
                  ))}
                </select>
              </div>

              {/* Vehicle Breakdown */}
              <div>
                <span className="text-slate-300 font-semibold block mb-1">Simulate Fleet Breakdown:</span>
                <select
                  value={brokenVehicleId}
                  onChange={(e) => setBrokenVehicleId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                >
                  <option value="none">{vehicles.length === 0 ? 'No Vehicles Registered' : 'All Fleet Vehicles Operational'}</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} Stalled / Breakdown</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Execution Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleResetToBaseline}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Baseline (5 Camps / 3 Depots)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveScenario}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold flex items-center gap-2 border border-amber-500/30 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save to Briefing Gallery</span>
              </button>

              <button
                onClick={handleRunSimulation}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-rose-600 to-rose-500 hover:from-amber-500 hover:to-rose-400 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run What-If Simulation Engine</span>
              </button>
            </div>
          </div>

          {/* SIDE-BY-SIDE BEFORE VS AFTER COMPARATIVE ANALYSIS */}
          <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-rose-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Before vs. After Comparative Impact Analysis
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Direct mathematical variance between Live Production Baseline and What-If Scenario
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                isSimulated ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {isSimulated ? 'Simulated Variance Mode' : 'Baseline Active'}
              </span>
            </div>

            {/* 4 Comparative Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Displaced Population
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 line-through text-xs font-mono">{basePop}</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-amber-400 font-bold text-sm font-mono">{simPop}</span>
                </div>
                <span className="text-[10px] text-rose-400 font-semibold block mt-0.5">
                  +{Math.round((popMultiplier - 1.0) * 100)}% Surge Deficit
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Critical Priority Camps
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 line-through text-xs font-mono">{baseCritCamps} Camps</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-rose-400 font-bold text-sm font-mono">{simCritCamps} Camps</span>
                </div>
                <span className="text-[10px] text-rose-400 font-semibold block mt-0.5">
                  +{simCritCamps - baseCritCamps} Critical Escalations
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Avg Transit Latency
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 line-through text-xs font-mono">{baseLatency} mins</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-amber-300 font-bold text-sm font-mono">{simLatency} mins</span>
                </div>
                <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                  +{simLatency - baseLatency} mins Detour Delay
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  Overall Unmet Shortage
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-400 line-through text-xs font-mono">{baseShortage}%</span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="text-rose-500 font-bold text-sm font-mono">{simShortage}%</span>
                </div>
                <span className="text-[10px] text-rose-400 font-semibold block mt-0.5">
                  +{simShortage - baseShortage}% Supply Deficit
                </span>
              </div>
            </div>

            {/* Additional Fleet / Inventory Resources Required Card */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 text-xs block">
                  Autonomous Recommended Mitigation Strategy:
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  To eliminate the simulated +{simShortage - baseShortage}% deficit under this scenario, ReliefLink recommends:
                  <b> Requesting 2 additional mutual-aid 10-Ton vehicles</b> and activating <b>inter-state surplus transfer of 1,200L potable water from regional reservoir depots</b>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

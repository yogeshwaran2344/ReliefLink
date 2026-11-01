import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Info,
  TrendingUp,
  AlertTriangle,
  HeartPulse,
  Users,
  Clock,
  Layers,
  CheckCircle,
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';
import { calculatePriorityScore } from '../utils/aiEstimationEngine';

export default function Module3_AIPriorityDemand() {
  const { camps, warehouses, setActiveTab, triggerAIAllocation, setupAroundCurrentLocation, userLocation } = useRelief();

  const [selectedCampId, setSelectedCampId] = useState(camps[0]?.id || null);

  // Compute live scores for all camps
  const scoredCamps = camps.map(camp => ({
    ...camp,
    aiAnalysis: calculatePriorityScore(camp)
  })).sort((a, b) => b.aiAnalysis.score - a.aiAnalysis.score);

  const selectedCamp = scoredCamps.find(c => c.id === selectedCampId) || scoredCamps[0] || null;

  if (camps.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">No Camps Registered Yet (Clean Slate)</h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            The Explainable AI (XAI) Priority Engine computes multi-factor triage scores as soon as camps are registered or deployed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setupAroundCurrentLocation(userLocation?.lat, userLocation?.lng)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition"
            >
              <span>⚡ Setup 3 Camps Around My GPS</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <span>➕ Register New Camp</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Module 3: Core Differentiator
            </span>
            <span className="text-slate-400 text-xs">Explainable AI (XAI) Priority Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            AI-Based Priority & Demand Estimation
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            A transparent, multi-factor algorithmic engine evaluating 8 life-critical metrics to determine objective urgency indices with complete natural-language explainability for commanders and judges.
          </p>
        </div>

        <button
          onClick={() => {
            triggerAIAllocation();
            setActiveTab('allocation');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Pass to Allocation Engine →</span>
        </button>
      </div>

      {/* Main Grid: Priority Scores Table + Deep Explainability Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Camp Priority Ranking Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Ranked Emergency Triage Scores (1 to 100)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Click a camp to inspect AI decision logic</span>
          </div>

          <div className="divide-y divide-slate-800">
            {scoredCamps.map((camp, idx) => {
              const isSelected = camp.id === selectedCamp.id;
              const { score, status, badgeColor, explanation, breakdown } = camp.aiAnalysis;

              return (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampId(camp.id)}
                  className={`p-4 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-l-4 border-indigo-500'
                      : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center border border-slate-700">
                        #{idx + 1}
                      </span>
                      <h3 className="font-bold text-sm text-white">{camp.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${badgeColor}`}>
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 italic border-l-2 border-indigo-500/50 pl-2">
                      "{explanation}"
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                      <span>👥 Pop: <b className="text-slate-200">{camp.population.toLocaleString()}</b></span>
                      <span>🚑 Injured: <b className="text-rose-400">{camp.injured}</b></span>
                      <span>⏰ Last Delivery: <b className="text-amber-300">{camp.lastDeliveryHoursAgo}h ago</b></span>
                      <span>⚠️ Severity: <b className="text-slate-200">{camp.severity}</b></span>
                    </div>
                  </div>

                  {/* Score Gauge */}
                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">{score} <span className="text-xs font-normal text-slate-400">/ 100</span></div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Priority Index</div>
                    </div>

                    <div className="w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-sm bg-slate-950 shadow-inner" style={{
                      borderColor: status === 'Critical' ? '#ef4444' : status === 'High' ? '#f59e0b' : '#3b82f6',
                      color: status === 'Critical' ? '#ef4444' : status === 'High' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {score}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Explainable AI Inspector Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Explainable AI (XAI) Attribution
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {selectedCamp.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedCamp.aiAnalysis.badgeColor}`}>
                Score: {selectedCamp.aiAnalysis.score}/100 • {selectedCamp.aiAnalysis.status}
              </span>
            </div>
          </div>

          {/* Breakdown Factor Bars */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
              Algorithm Metric Contributions:
            </h4>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Affected Population (Max 25 pts)
                </span>
                <b>{selectedCamp.aiAnalysis.breakdown.populationContribution} pts</b>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(selectedCamp.aiAnalysis.breakdown.populationContribution / 25) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                  Casualties & Trauma Urgency (Max 25 pts)
                </span>
                <b className="text-rose-400">{selectedCamp.aiAnalysis.breakdown.casualtyContribution} pts</b>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(selectedCamp.aiAnalysis.breakdown.casualtyContribution / 25) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Supply Latency / Time Elapsed (Max 20 pts)
                </span>
                <b className="text-amber-400">{selectedCamp.aiAnalysis.breakdown.timeLatencyContribution} pts</b>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(selectedCamp.aiAnalysis.breakdown.timeLatencyContribution / 20) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-400" />
                  Disaster Severity & Access Risk (Max 15 pts)
                </span>
                <b>{selectedCamp.aiAnalysis.breakdown.disasterSeverityContribution} pts</b>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(selectedCamp.aiAnalysis.breakdown.disasterSeverityContribution / 15) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Unmet Demand Ratio (Max 15 pts)
                </span>
                <b>{selectedCamp.aiAnalysis.breakdown.unmetDemandContribution} pts</b>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(selectedCamp.aiAnalysis.breakdown.unmetDemandContribution / 15) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-slate-200">AI Recommendation:</span>
            <p className="text-[11px] text-slate-400">
              Immediate supply convoy dispatched from Central Depot with IV fluids, antibiotics, 450 food packets and 700L water. Priority ranking safeguards critical lives first.
            </p>
          </div>
        </div>
      </div>

      {/* AI Architectural Note: Rule-Based Transparency vs ML Validation (PPT Alignment) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-sm">
              AI Methodology Architecture: Transparent Rule Engine vs ML Forecasting Validation
            </h3>
          </div>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
            Defense & Audit Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>Active Engine: Transparent Multi-Factor Decision Matrix</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              In life-critical emergency triage, black-box neural networks present fatal hallucination and bias risks. ReliefLink implements an explainable, deterministic multi-criteria decision engine guaranteeing that every priority score is fully traceable to human casualties, water deprivation hours, and field medical shortages.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-400">
              <BarChart2 className="w-4 h-4" />
              <span>Phase 2 Extension: ML Demand Forecasting Pipeline</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              As historical disaster telemetry accumulates over successive 72-hour operational cycles, ReliefLink ingests time-series features (precipitation curves, river gauges, casualty influx rates) into ARIMA and Gradient Boosted trees to forecast supply depletion 48 hours in advance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

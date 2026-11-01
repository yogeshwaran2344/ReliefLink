import React, { useState } from 'react';
import {
  Warehouse,
  Boxes,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  Truck
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';
import { computeSurplusRedistribution } from '../utils/redistributionEngine';

export default function Module4_WarehouseInventory() {
  const { warehouses, camps, executeSurplusTransfer } = useRelief();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || 'wh-alpha');
  const [transferSuccessMessage, setTransferSuccessMessage] = useState(null);

  // Compute live surplus redistribution recommendations
  const surplusRecommendations = computeSurplusRedistribution(warehouses, camps);

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0];

  const handleExecuteTransfer = (rec) => {
    executeSurplusTransfer(rec);
    setTransferSuccessMessage(`Transferred ${rec.recommendedTransferQty} ${rec.unit} from ${rec.donorName} to ${rec.recipientName}!`);
    setTimeout(() => setTransferSuccessMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-500/30">
              Module 4: Stock & Logistics
            </span>
            <span className="text-emerald-400 text-xs font-semibold">★ Core Proposed USP: Autonomous Surplus Redistribution</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Smart Inventory & Warehouse Management
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Real-time multi-depot stock monitoring, expiry date tracking, automatic low-stock alarms, and algorithmic inter-warehouse balancing.
          </p>
        </div>
      </div>

      {/* SUCCESS BANNER FOR TRANSFERS */}
      {transferSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 flex items-center gap-3 text-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{transferSuccessMessage}</span>
        </div>
      )}

      {/* CORE USP HIGHLIGHT: Autonomous Surplus Redistribution Engine */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-500/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-500/40 text-blue-400">
              <ArrowRightLeft className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Unique Selling Proposition (USP)</span>
                <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] font-extrabold uppercase">Live AI Engine</span>
              </div>
              <h2 className="text-lg font-extrabold text-white">
                Autonomous Surplus Redistribution Engine
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-md">
            Identifies supply surpluses at one depot (e.g. Warehouse A) and automatically routes transfers to relieve critical shortages at another depot (e.g. Warehouse B).
          </p>
        </div>

        {surplusRecommendations.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 text-center text-xs text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            Depot inventory balances are currently optimal. No inter-warehouse deficit emergency detected.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surplusRecommendations.map(rec => (
              <div key={rec.id} className="bg-slate-900/90 border border-blue-500/40 rounded-xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Rebalance: {rec.itemDisplayName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold">
                    {rec.recommendedTransferQty} {rec.unit}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center gap-2 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Donor Depot</span>
                    <b className="text-emerald-400 text-xs block truncate">{rec.donorName.split(' ')[0]} {rec.donorName.split(' ')[1]}</b>
                    <span className="text-[10px] text-slate-400">Surplus: +{rec.donorSurplus}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center text-blue-400">
                    <Truck className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-mono font-bold text-slate-300">{rec.transferWeightKg} kg</span>
                    <span className="text-[9px] text-slate-400">~{rec.estimatedTransitHours}h transit</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Shortage Depot</span>
                    <b className="text-rose-400 text-xs block truncate">{rec.recipientName.split(' ')[0]} {rec.recipientName.split(' ')[1]}</b>
                    <span className="text-[10px] text-slate-400">Deficit: -{rec.recipientDeficit}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 italic">
                  "{rec.impactSummary}"
                </p>

                <button
                  onClick={() => handleExecuteTransfer(rec)}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Inter-Depot Transfer ({rec.recommendedTransferQty} {rec.unit})</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Warehouse Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        {warehouses.map(wh => {
          const isSelected = wh.id === selectedWarehouse.id;
          const hasLowStock = Object.values(wh.stock).some(s => s.available <= s.minThreshold);

          return (
            <button
              key={wh.id}
              onClick={() => setSelectedWarehouseId(wh.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>{wh.name}</span>
              {hasLowStock && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Low stock threshold exceeded"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Warehouse Stock Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Boxes className="w-4 h-4 text-blue-400" />
              <span>{selectedWarehouse.name} ({selectedWarehouse.code})</span>
            </h3>
            <p className="text-xs text-slate-400">{selectedWarehouse.address} • Max Capacity: {selectedWarehouse.capacityKg.toLocaleString()} kg</p>
          </div>

          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Assigned Vehicle: <b>{selectedWarehouse.assignedVehicles.join(', ')}</b>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Relief Material Category</th>
                <th className="px-4 py-3">Total In Stock</th>
                <th className="px-4 py-3">Reserved</th>
                <th className="px-4 py-3">Dispatched</th>
                <th className="px-4 py-3">Available Buffer</th>
                <th className="px-4 py-3">Min Safe Threshold</th>
                <th className="px-4 py-3">Batch Expiry Countdown</th>
                <th className="px-4 py-3 text-right">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(selectedWarehouse.stock).map(([key, item]) => {
                const isLow = item.available <= item.minThreshold;
                const isSurplus = item.available >= item.minThreshold * 2;

                return (
                  <tr key={key} className={`hover:bg-slate-800/40 transition ${isLow ? 'bg-amber-950/10' : ''}`}>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        {key === 'food' && '🍞 Ready-to-Eat Food Packets'}
                        {key === 'water' && '💧 Bottled Drinking Water'}
                        {key === 'medical' && '🩹 Emergency Medical Kits'}
                        {key === 'shelter' && '⛺ Family Shelter & Hygiene Kits'}
                      </div>
                      <div className="text-[10px] text-slate-400">Unit weight: ~{item.unitWeightKg || 1} kg</div>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-200">
                      {item.total.toLocaleString()} {item.unit}
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {item.reserved} {item.unit}
                    </td>

                    <td className="px-4 py-3.5 text-sky-400 font-mono">
                      {item.dispatched} {item.unit}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-sm text-white font-mono">
                        {item.available.toLocaleString()} {item.unit}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400 font-mono">
                      {item.minThreshold} {item.unit}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`text-[11px] font-semibold ${item.expiryDays < 20 ? 'text-rose-400' : 'text-slate-300'}`}>
                          {item.expiryDays} days remaining
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">Batch certified</div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Low Stock Alert
                        </span>
                      ) : isSurplus ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          Surplus Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-semibold">
                          Nominal Stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

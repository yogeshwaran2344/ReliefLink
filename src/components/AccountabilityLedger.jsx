import React from 'react';
import {
  DollarSign,
  TrendingDown,
  ShieldCheck,
  FileSpreadsheet,
  AlertTriangle,
  History,
  Boxes,
  CheckCircle2,
  Download,
  Search
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function AccountabilityLedger() {
  const { camps, warehouses, deliveries, auditLogs } = useRelief();

  // Unit financial valuations ($ USD / standard humanitarian aid accounting)
  const UNIT_VALUES = {
    food: 3.50, // $3.50 per RTE meal packet
    water: 1.25, // $1.25 per liter potable water
    medical: 48.00, // $48.00 per trauma kit
    shelter: 120.00 // $120.00 per hygiene/shelter pack
  };

  // Calculate total values
  const totalFoodDelivered = camps.reduce((sum, c) => sum + (c.received?.food || 0), 0);
  const totalWaterDelivered = camps.reduce((sum, c) => sum + (c.received?.water || 0), 0);
  const totalMedicalDelivered = camps.reduce((sum, c) => sum + (c.received?.medical || 0), 0);

  const totalDeliveredValue = (totalFoodDelivered * UNIT_VALUES.food) +
                              (totalWaterDelivered * UNIT_VALUES.water) +
                              (totalMedicalDelivered * UNIT_VALUES.medical);

  // Shrinkage & Loss from discrepancies
  let totalMissingFood = 0;
  let totalMissingMedical = 0;
  let totalMissingWater = 0;

  deliveries.forEach(d => {
    if (d.discrepancy) {
      totalMissingFood += d.discrepancy.foodMissing || 0;
      totalMissingWater += d.discrepancy.waterMissing || 0;
      totalMissingMedical += d.discrepancy.medicalMissing || 0;
    }
  });

  const totalLossValue = (totalMissingFood * UNIT_VALUES.food) +
                         (totalMissingWater * UNIT_VALUES.water) +
                         (totalMissingMedical * UNIT_VALUES.medical);

  const netIntegrityRate = totalDeliveredValue > 0 ? (((totalDeliveredValue - totalLossValue) / totalDeliveredValue) * 100).toFixed(1) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Accountability & Audit
            </span>
            <span className="text-slate-400 text-xs">Transparent Material & Financial Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Resource Accountability & Loss Investigation Ledger
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Quantitative chain-of-custody tracking verifying exact material movements, unit valuations, shrinkage audits, and approval signatures.
          </p>
        </div>
      </div>

      {/* Financial Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value Delivered */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Gross Aid Delivered</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${totalDeliveredValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Valued across food, water, medical
          </div>
        </div>

        {/* Total Transit Loss / Shrinkage */}
        <div className="bg-slate-900 border border-rose-500/30 bg-rose-500/5 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-300 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Transit Damage & Loss</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            ${totalLossValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-rose-300/80 mt-1">
            {totalMissingFood} food pkts, {totalMissingMedical} med kits lost
          </div>
        </div>

        {/* Net Delivery Integrity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Delivery Integrity</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {netIntegrityRate}%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            100% accounted on ground audit
          </div>
        </div>

        {/* Active Investigations */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Discrepancy Cases</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            1 Open
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Case #INV-101 (Dock loading short)
          </div>
        </div>
      </div>

      {/* Discrepancy & Loss Investigation Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              Supply Discrepancy & Missing Cargo Investigation Log
            </h3>
          </div>
          <span className="text-xs text-slate-400">Formal Accountability Ledger</span>
        </div>

        <div className="p-4 space-y-3">
          <div className="bg-slate-800/80 border border-amber-500/40 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                    CASE #INV-101
                  </span>
                  <span className="font-bold text-white text-xs">
                    Convoy DEL-2026-001 (Warehouse A ➔ Camp A)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Target Recipient: <b>Dr. Ananya Roy</b> • Vehicle: <b>Heavy Truck RL-01 (Rajendra Singh)</b>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase border border-rose-500/40">
                Loss Claim: $275.00
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-700/80">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Itemized Discrepancy Count:</span>
                <div className="text-slate-200 mt-0.5 space-y-0.5">
                  <div>• Food Rations: Dispatched 200, Received 190 (<b className="text-rose-400">-10 missing</b>)</div>
                  <div>• Medical Kits: Dispatched 50, Received 45 (<b className="text-rose-400">-5 missing</b>)</div>
                  <div>• Drinking Water: Dispatched 300, Received 300 (<b className="text-emerald-400">0 discrepancy</b>)</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Investigation Finding:</span>
                <p className="text-slate-300 text-[11px] mt-0.5 italic">
                  "10 food packets incurred water damage during riverbank ford crossing. 5 medical kits short-shipped at Warehouse A loading bay. Disciplinary dock review scheduled."
                </p>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                  Sign-off Ack: ACK-SIGNED-AR-1044 (Verified with photo proof)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse-Wise Material Flow & Balance Sheet */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white text-sm">
              Warehouse Material Balance Sheet & Unit Valuation
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="px-4 py-3">Warehouse Hub</th>
                <th className="px-4 py-3">Total Inflow Value ($)</th>
                <th className="px-4 py-3">Dispatched Value ($)</th>
                <th className="px-4 py-3">Active Buffer Reserve ($)</th>
                <th className="px-4 py-3">Capacity (kg)</th>
                <th className="px-4 py-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {warehouses.map(wh => {
                const totalVal = (wh.stock.food.total * UNIT_VALUES.food) +
                                 (wh.stock.water.total * UNIT_VALUES.water) +
                                 (wh.stock.medical.total * UNIT_VALUES.medical);

                const dispVal = (wh.stock.food.dispatched * UNIT_VALUES.food) +
                                (wh.stock.water.dispatched * UNIT_VALUES.water) +
                                (wh.stock.medical.dispatched * UNIT_VALUES.medical);

                const availVal = (wh.stock.food.available * UNIT_VALUES.food) +
                                 (wh.stock.water.available * UNIT_VALUES.water) +
                                 (wh.stock.medical.available * UNIT_VALUES.medical);

                return (
                  <tr key={wh.id} className="hover:bg-slate-800/40 transition font-mono">
                    <td className="px-4 py-3.5 font-sans font-bold text-white">
                      {wh.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-200">
                      ${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-sky-400">
                      ${dispVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-emerald-400 font-bold">
                      ${availVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {wh.capacityKg.toLocaleString()} kg
                    </td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Reconciled
                      </span>
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

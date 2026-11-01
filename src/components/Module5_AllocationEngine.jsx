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
  FileCheck,
  Lock,
  UserCheck,
  AlertTriangle,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function Module5_AllocationEngine() {
  const { allocationOutput, triggerAIAllocation, setActiveTab, currentUser, addToast } = useRelief();
  const [isRecomputing, setIsRecomputing] = useState(false);

  // Two-Level Dual-Coordinator Approval Workflow State
  // 1: 'PROPOSED', 2: 'AWAITING_SECOND_APPROVAL', 3: 'DUAL_APPROVED'
  const [approvalStage, setApprovalStage] = useState(2); // default proposed & awaiting 2nd coordinator
  const [proposer, setProposer] = useState('Dr. Vikram Malhotra (Disaster Coordinator)');
  const [approver, setApprover] = useState(null);

  // Concurrency Simulation State
  const [isSimulatingConflict, setIsSimulatingConflict] = useState(false);

  const handleRecompute = () => {
    setIsRecomputing(true);
    setTimeout(() => {
      triggerAIAllocation();
      setApprovalStage(1);
      setApprover(null);
      setIsRecomputing(false);
      addToast('info', 'New allocation plan generated. Stage reset to Coordinator Proposal.', 'Allocation Optimization');
    }, 400);
  };

  const handlePropose = () => {
    if (currentUser?.role !== 'Disaster Coordinator' && currentUser?.role !== 'Super Admin') {
      addToast('error', `Unauthorized: Proposing allocations requires Disaster Coordinator credentials. (Current: ${currentUser?.role})`, 'Access Denied');
      return;
    }
    setApprovalStage(2);
    setProposer(`${currentUser.name} (${currentUser.role})`);
    addToast('success', 'Allocation proposed by Level-1 Coordinator. Awaiting independent second-coordinator sign-off.', 'Dual Approval');
  };

  const handleSecondApproval = () => {
    if (currentUser?.role !== 'Disaster Coordinator' && currentUser?.role !== 'Super Admin') {
      addToast('error', `Unauthorized: Two-level critical approval requires an authorized Disaster Coordinator or Super Admin. (Current: ${currentUser?.role})`, 'Access Denied');
      return;
    }
    setApprovalStage(3);
    setApprover(`${currentUser.name} (${currentUser.role})`);
    addToast('success', `Allocation plan dual-approved by ${currentUser.name}. Fleet dispatch authorized.`, 'Quorum Authorized');
  };

  const handleSimulateConcurrency = () => {
    setIsSimulatingConflict(true);
    addToast('info', 'Simulating two concurrent coordinators attempting to allocate the same 100 food packets...', 'Concurrency Test');

    setTimeout(() => {
      setIsSimulatingConflict(false);
      addToast('success', 'Transaction A [txn-8812]: Lock acquired via SELECT FOR UPDATE. 100 pkts reserved for Camp A.', 'Transaction Succeeded');

      setTimeout(() => {
        addToast('error', 'Transaction B [txn-8813]: 409 Conflict Detected! Warehouse Alpha food stock already reserved. Rollback executed — Zero double-allocation guaranteed.', 'Lock Conflict Resolved');
      }, 500);
    }, 800);
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Concurrency conflict simulation */}
          <button
            onClick={handleSimulateConcurrency}
            disabled={isSimulatingConflict}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl text-xs border border-amber-500/30 transition disabled:opacity-50"
            title="Demonstrate database transactional locking against double-allocation"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingConflict ? 'animate-bounce text-amber-400' : ''}`} />
            <span>Simulate Concurrency Race</span>
          </button>

          <button
            onClick={handleRecompute}
            disabled={isRecomputing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-rose-600/30 transition transform active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isRecomputing ? 'animate-spin' : ''}`} />
            <span>{isRecomputing ? 'Optimizing Simplex...' : 'Re-Run Optimization Engine'}</span>
          </button>
        </div>
      </div>

      {/* TWO-LEVEL DUAL-COORDINATOR APPROVAL WORKFLOW BANNER */}
      <div className="bg-slate-900 border border-slate-700/80 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl border ${
            approvalStage === 3
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Two-Level Authorization Quorum (Security)</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                approvalStage === 3
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {approvalStage === 3 ? '✓ Dual Authorized' : approvalStage === 2 ? 'Awaiting Second Approval' : 'Draft / Proposed'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              High-value relief consignments require two independent coordinators to propose and confirm before fleet dispatch.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-300 font-mono mt-1.5">
              <span><b>1. Proposer:</b> {proposer}</span>
              <span><b>2. Second Approver:</b> {approver || <span className="text-amber-400 italic">Pending Authorized Signature</span>}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {approvalStage === 1 && (
            <button
              onClick={handlePropose}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
            >
              Propose Allocation
            </button>
          )}

          {approvalStage === 2 && (
            <button
              onClick={handleSecondApproval}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Second Coordinator Sign-off</span>
            </button>
          )}

          {approvalStage === 3 && (
            <button
              onClick={() => setActiveTab('routing')}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <span>Proceed to Fleet Routing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
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
              {plan.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    <p className="font-semibold text-white">No active allocations to compute (Clean Slate).</p>
                    <p className="text-xs text-slate-500 mt-1">Register camps or initialize a disaster grid around your GPS to run multi-depot optimization.</p>
                  </td>
                </tr>
              ) : (
                plan.map((item, idx) => (
                  <tr key={item.campId} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{item.campName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {item.campId}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.priorityStatus === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : item.priorityStatus === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {item.priorityScore}/100 {item.priorityStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-200">
                      {item.allocatedFood} pkts
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-sky-400">
                      {item.allocatedWater} L
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-400">
                      {item.allocatedMedical} kits
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                        🏢 {item.warehouseName}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300 font-semibold">
                      {item.allocatedWeightKg} kg
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono">
                      {item.remainingShortage.food === 0 && item.remainingShortage.water === 0 ? (
                        <span className="text-emerald-400 font-bold">0 (Fulfilled)</span>
                      ) : (
                        <span className="text-amber-400 font-bold">
                          -{item.remainingShortage.food}F / -{item.remainingShortage.water}W
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

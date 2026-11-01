import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  AlertTriangle,
  FileSignature,
  Camera,
  History,
  Eye,
  ArrowRight,
  Sparkles,
  QrCode,
  ScanLine
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';
import QRVerificationModal from './QRVerificationModal';

export default function Module7_DeliveryVerification() {
  const { deliveries, updateDeliveryStage, verifyDeliveryReceipt } = useRelief();

  const [activeVerificationDelivery, setActiveVerificationDelivery] = useState(null);
  const [isQROpen, setIsQROpen] = useState(false);
  const [selectedQRDelivery, setSelectedQRDelivery] = useState(null);

  const [verificationForm, setVerificationForm] = useState({
    receivedFood: 0,
    receivedWater: 0,
    receivedMedical: 0,
    recipientName: '',
    notes: '',
    photoProofUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'
  });

  const stages = [
    { num: 1, label: 'Delivery Created', desc: 'Coordinator approval' },
    { num: 2, label: 'Dispatched', desc: 'Warehouse dock exit' },
    { num: 3, label: 'In Transit', desc: 'Fleet convoy on route' },
    { num: 4, label: 'Arrived', desc: 'Reached camp perimeter' },
    { num: 5, label: 'Receipt Verification', desc: 'Ground count audit' },
    { num: 6, label: 'Completed', desc: 'Stock ledger closed' },
  ];

  const openVerificationModal = (del) => {
    setActiveVerificationDelivery(del);
    setVerificationForm({
      receivedFood: del.verifiedQuantities?.food ?? del.dispatchedQuantities.food,
      receivedWater: del.verifiedQuantities?.water ?? del.dispatchedQuantities.water,
      receivedMedical: del.verifiedQuantities?.medical ?? del.dispatchedQuantities.medical,
      recipientName: del.recipientName || 'Dr. Ananya Roy',
      notes: del.discrepancy?.notes || '',
      photoProofUrl: del.photoProofUrl || 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80'
    });
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (!activeVerificationDelivery) return;

    verifyDeliveryReceipt(activeVerificationDelivery.id, verificationForm);
    setActiveVerificationDelivery(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              Module 7: Ground Truth & Verification
            </span>
            <span className="text-slate-400 text-xs">End-to-End Delivery Accountability</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Delivery Tracking & Receipt Verification
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Supplies are never assumed delivered upon warehouse dispatch. Every convoy undergoes 6 rigorous checkpoints with quantitative discrepancy reconciliation.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedQRDelivery(deliveries[0]);
            setIsQROpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition"
        >
          <QrCode className="w-4 h-4" />
          <span>Field Optical QR Scanner & Passes</span>
        </button>
      </div>

      {/* 6-Stage Delivery Pipeline Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Standard 6-Stage Humanitarian Delivery Protocol:
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {stages.map((st) => (
            <div key={st.num} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-center space-y-1">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 text-xs font-bold inline-flex items-center justify-center">
                {st.num}
              </span>
              <div className="font-bold text-xs text-white">{st.label}</div>
              <div className="text-[10px] text-slate-400">{st.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Deliveries List */}
      <div className="space-y-4">
        {deliveries.map(del => {
          const isDone = del.stage === 'Completed';
          const hasDiscrepancy = del.discrepancy && (del.discrepancy.foodMissing > 0 || del.discrepancy.waterMissing > 0 || del.discrepancy.medicalMissing > 0);

          return (
            <div key={del.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition">
              {/* Delivery Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-white">{del.deliveryCode}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    }`}>
                      Stage {del.stageIndex}/6: {del.stage}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Route: <b className="text-slate-200">{del.warehouseName}</b> ➔ <b className="text-slate-200">{del.targetLocationName}</b>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedQRDelivery(del);
                      setIsQROpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                    title="Inspect digital QR Consignment pass"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Pass</span>
                  </button>

                  {del.stageIndex < 4 && (
                    <button
                      onClick={() => updateDeliveryStage(del.id, del.stageIndex + 1)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <span>Advance to {stages[del.stageIndex].label}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {del.stageIndex >= 4 && !isDone && (
                    <button
                      onClick={() => openVerificationModal(del)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Perform Ground Verification Audit</span>
                    </button>
                  )}

                  {isDone && (
                    <button
                      onClick={() => openVerificationModal(del)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Signed Audit Ledger</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Stepper Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(del.stageIndex / 6) * 100}%` }}
                />
              </div>

              {/* Dispatched vs Received Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Dispatched */}
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Warehouse Dispatched</span>
                  <div className="space-y-1">
                    <div className="flex justify-between"><span>Food Packets:</span> <b className="text-white">{del.dispatchedQuantities.food}</b></div>
                    <div className="flex justify-between"><span>Water Liters:</span> <b className="text-white">{del.dispatchedQuantities.water}</b></div>
                    <div className="flex justify-between"><span>Medical Kits:</span> <b className="text-white">{del.dispatchedQuantities.medical}</b></div>
                  </div>
                </div>

                {/* Received & Verified */}
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Recipient Ground Count</span>
                  {del.verifiedQuantities ? (
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>Food Packets:</span> <b className="text-emerald-400">{del.verifiedQuantities.food}</b></div>
                      <div className="flex justify-between"><span>Water Liters:</span> <b className="text-emerald-400">{del.verifiedQuantities.water}</b></div>
                      <div className="flex justify-between"><span>Medical Kits:</span> <b className="text-emerald-400">{del.verifiedQuantities.medical}</b></div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic py-2">Awaiting camp arrival and physical inventory count...</div>
                  )}
                </div>

                {/* Discrepancy & Proof Status */}
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Discrepancy & Accountability</span>
                  {hasDiscrepancy ? (
                    <div className="text-rose-400 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Discrepancy Flagged:
                      </div>
                      <div className="text-[11px] text-rose-300">
                        Missing: {del.discrepancy.foodMissing} Food, {del.discrepancy.medicalMissing} Medical
                      </div>
                      <div className="text-[10px] text-slate-400 italic truncate">{del.discrepancy.notes}</div>
                    </div>
                  ) : del.verifiedQuantities ? (
                    <div className="text-emerald-400 space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        100% Intact Receipt
                      </div>
                      <div className="text-[10px] text-slate-400">Ack: {del.recipientAcknowledgement}</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[11px]">Audit pending recipient sign-off.</div>
                  )}
                </div>
              </div>

              {/* Audit Log Timeline */}
              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                  <History className="w-3.5 h-3.5" /> Chain-of-Custody Event Log:
                </span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  {del.routeAudit.map((log, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <span className="font-mono text-slate-500">[{log.time}]</span>
                      <span className="text-slate-300">{log.event}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification Audit Modal Form */}
      {activeVerificationDelivery && (
        <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-emerald-400" />
                  Field Delivery Verification Form
                </h3>
                <span className="text-xs text-slate-400">
                  Convoy {activeVerificationDelivery.deliveryCode} • Destination: {activeVerificationDelivery.targetLocationName}
                </span>
              </div>
              <button onClick={() => setActiveVerificationDelivery(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="font-bold text-slate-200">Reconcile Dispatched vs Physical Received Counts:</div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  {/* Food */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Food Packets</span>
                    <span className="text-xs text-slate-500">Dispatched: <b>{activeVerificationDelivery.dispatchedQuantities.food}</b></span>
                    <input
                      type="number"
                      min="0"
                      value={verificationForm.receivedFood}
                      onChange={e => setVerificationForm({ ...verificationForm, receivedFood: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 mt-1 text-center font-bold text-white"
                    />
                    {parseInt(verificationForm.receivedFood, 10) < activeVerificationDelivery.dispatchedQuantities.food && (
                      <span className="text-rose-400 text-[10px] block mt-1 font-semibold">
                        -{activeVerificationDelivery.dispatchedQuantities.food - parseInt(verificationForm.receivedFood, 10)} missing
                      </span>
                    )}
                  </div>

                  {/* Water */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Water (Liters)</span>
                    <span className="text-xs text-slate-500">Dispatched: <b>{activeVerificationDelivery.dispatchedQuantities.water}</b></span>
                    <input
                      type="number"
                      min="0"
                      value={verificationForm.receivedWater}
                      onChange={e => setVerificationForm({ ...verificationForm, receivedWater: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 mt-1 text-center font-bold text-white"
                    />
                  </div>

                  {/* Medical */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Medical Kits</span>
                    <span className="text-xs text-slate-500">Dispatched: <b>{activeVerificationDelivery.dispatchedQuantities.medical}</b></span>
                    <input
                      type="number"
                      min="0"
                      value={verificationForm.receivedMedical}
                      onChange={e => setVerificationForm({ ...verificationForm, receivedMedical: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 mt-1 text-center font-bold text-white text-rose-300"
                    />
                    {parseInt(verificationForm.receivedMedical, 10) < activeVerificationDelivery.dispatchedQuantities.medical && (
                      <span className="text-rose-400 text-[10px] block mt-1 font-semibold">
                        -{activeVerificationDelivery.dispatchedQuantities.medical - parseInt(verificationForm.receivedMedical, 10)} missing
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Recipient Camp Coordinator Name *</label>
                  <input
                    type="text"
                    required
                    value={verificationForm.recipientName}
                    onChange={e => setVerificationForm({ ...verificationForm, recipientName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Inspection & Damage Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 food packets damaged by road splash"
                    value={verificationForm.notes}
                    onChange={e => setVerificationForm({ ...verificationForm, notes: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Delivery Photo Evidence Proof</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationForm.photoProofUrl}
                    onChange={e => setVerificationForm({ ...verificationForm, photoProofUrl: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveVerificationDelivery(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign & Complete Delivery Audit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scannable Field QR Manifest Modal */}
      <QRVerificationModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        selectedDelivery={selectedQRDelivery}
      />
    </div>
  );
}

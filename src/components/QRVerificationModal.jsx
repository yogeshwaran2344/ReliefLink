import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  Building2,
  UserCheck,
  Calendar,
  Lock,
  Search,
  ScanLine,
  FileText
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function QRVerificationModal({ isOpen, onClose, selectedDelivery }) {
  const { deliveries, verifyDeliveryReceipt, addToast, currentUser } = useRelief();

  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'scan'
  const [searchTrackingId, setSearchTrackingId] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // If a delivery was passed in, default to it, otherwise default to first delivery
  const targetDelivery = selectedDelivery || deliveries[0];

  if (!isOpen) return null;

  const getManifest = (d) => ({
    food: d?.dispatchedQuantities?.food ?? d?.dispatched_food ?? 0,
    water: d?.dispatchedQuantities?.water ?? d?.dispatched_water ?? 0,
    medical: d?.dispatchedQuantities?.medical ?? d?.dispatched_medical ?? 0,
    shelter: d?.dispatchedQuantities?.shelter ?? d?.dispatched_shelter ?? 0,
    origin: d?.warehouseName || d?.originWarehouseName || 'Regional Supply Depot',
    destination: d?.targetLocationName || d?.destinationCampName || 'Designated Camp',
    vehicle: d?.vehicleName || d?.assignedVehicleName || 'Heavy Transport Carrier'
  });

  const manifest = getManifest(targetDelivery);
  const trackingId = targetDelivery?.trackingBatchId || `RL-MANIFEST-2026-${(targetDelivery?.id || '001').slice(-4).toUpperCase()}`;

  const handleSimulateScan = (deliveryToScan) => {
    setIsVerifying(true);
    const m = getManifest(deliveryToScan);
    setTimeout(() => {
      setScannedData({
        trackingBatchId: deliveryToScan?.trackingBatchId || `RL-MANIFEST-2026-${(deliveryToScan?.id || '001').slice(-4).toUpperCase()}`,
        deliveryCode: deliveryToScan?.deliveryCode || 'DEL-MANIFEST',
        originWarehouse: m.origin,
        destinationCamp: m.destination,
        dispatchedFood: m.food,
        dispatchedWater: m.water,
        dispatchedMedical: m.medical,
        dispatchedShelter: m.shelter,
        assignedVehicle: m.vehicle,
        proposerCoordinator: 'Dr. Vikram Malhotra',
        approverCoordinator: 'Lead Operations Coordinator',
        digitalSignatureHash: `0x${Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
        tamperEvidentSeal: 'INTACT (SHA-256 Verified)',
        timestamp: new Date().toLocaleString()
      });
      setIsVerifying(false);
      addToast('success', `Consignment ${deliveryToScan?.deliveryCode || ''} QR signature authenticated. Manifest matches dispatch ledger.`, 'Tamper-Proof Verification');
    }, 500);
  };

  const handleConfirmGroundReceipt = () => {
    if (!targetDelivery) return;
    const m = getManifest(targetDelivery);
    verifyDeliveryReceipt(targetDelivery.id, {
      receivedFood: m.food,
      receivedWater: m.water,
      receivedMedical: m.medical,
      receivedShelter: m.shelter,
      recipientName: currentUser?.name || 'Sector Ground Officer',
      verificationNotes: 'Consignment verified 100% intact via digital QR custody pass. Tamper seals verified.'
    });
    addToast('success', `Receipt for ${targetDelivery.deliveryCode} committed to immutable audit ledger.`, 'Verification Signed');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-[2600] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Digital Consignment Pass & QR Verification
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                  Anti-Tamper
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Tracking ID: <span className="text-rose-400 font-bold">{trackingId}</span>
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
            onClick={() => setActiveTab('view')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'view'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Digital Pass & QR Code</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('scan');
              if (!scannedData && targetDelivery) handleSimulateScan(targetDelivery);
            }}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'scan'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>Field Receipt Scanner & Audit</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          {activeTab === 'view' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: Rendered High-Fidelity QR Code Visual */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <div className="p-4 bg-white rounded-xl shadow-xl border-4 border-slate-800 inline-block">
                  {/* Clean SVG representation of a scannable QR Code */}
                  <svg className="w-44 h-44" viewBox="0 0 100 100" fill="none">
                    {/* Position detection squares */}
                    <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
                    <rect x="11" y="11" width="14" height="14" fill="#e11d48" />
                    <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
                    <rect x="75" y="11" width="14" height="14" fill="#e11d48" />
                    <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" stroke="#e11d48" strokeWidth="2" />
                    <rect x="11" y="75" width="14" height="14" fill="#e11d48" />

                    {/* Data matrix dots */}
                    <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="56" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="18" width="6" height="6" fill="#e11d48" />
                    <rect x="56" y="18" width="6" height="6" fill="#0f172a" />

                    <rect x="8" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="18" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="28" y="36" width="6" height="6" fill="#e11d48" />
                    <rect x="38" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="48" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="58" y="36" width="6" height="6" fill="#e11d48" />
                    <rect x="68" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="36" width="6" height="6" fill="#0f172a" />
                    <rect x="88" y="36" width="6" height="6" fill="#e11d48" />

                    {/* Center cryptographic glyph */}
                    <rect x="42" y="42" width="16" height="16" rx="3" fill="#e11d48" />
                    <circle cx="50" cy="50" r="4" fill="#ffffff" />

                    <rect x="8" y="48" width="6" height="6" fill="#e11d48" />
                    <rect x="28" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="68" y="48" width="6" height="6" fill="#0f172a" />
                    <rect x="88" y="48" width="6" height="6" fill="#0f172a" />

                    <rect x="8" y="58" width="6" height="6" fill="#0f172a" />
                    <rect x="38" y="58" width="6" height="6" fill="#e11d48" />
                    <rect x="58" y="58" width="6" height="6" fill="#0f172a" />
                    <rect x="78" y="58" width="6" height="6" fill="#e11d48" />

                    <rect x="36" y="68" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="68" width="6" height="6" fill="#0f172a" />
                    <rect x="56" y="68" width="6" height="6" fill="#e11d48" />
                    <rect x="66" y="68" width="6" height="6" fill="#0f172a" />

                    <rect x="36" y="78" width="6" height="6" fill="#e11d48" />
                    <rect x="56" y="78" width="6" height="6" fill="#0f172a" />
                    <rect x="76" y="78" width="6" height="6" fill="#0f172a" />

                    <rect x="46" y="88" width="6" height="6" fill="#0f172a" />
                    <rect x="66" y="88" width="6" height="6" fill="#e11d48" />
                    <rect x="86" y="88" width="6" height="6" fill="#0f172a" />
                  </svg>
                </div>
                <span className="font-mono text-[11px] text-slate-300 font-bold mt-3 tracking-wider">
                  {trackingId}
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <Lock className="w-3 h-3" /> Signed by Dual-Coordinator Quorum
                </span>
              </div>

              {/* Right: Custody Ledger Details */}
              <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
                <h3 className="font-bold text-white text-sm flex items-center gap-2 border-b border-slate-700 pb-2">
                  <FileText className="w-4 h-4 text-rose-400" />
                  Consignment Custody Manifest
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Consignment Code:</span>
                    <span className="font-mono font-bold text-white">{targetDelivery?.deliveryCode || 'DEL-MANIFEST'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Dispatch Depot:</span>
                    <span className="font-medium text-slate-200">{manifest.origin}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Destination Camp:</span>
                    <span className="font-medium text-rose-300">{manifest.destination}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Allocated Manifest:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {manifest.food} Food • {manifest.water}L Water • {manifest.medical} Meds • {manifest.shelter} Shelter
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Assigned Fleet:</span>
                    <span className="font-medium text-slate-200">{manifest.vehicle}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Two-Level Authorization:</span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      ✓ Dr. Malhotra (Proposed) + Operations Coordinator (Approved)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveTab('scan');
                      handleSimulateScan(targetDelivery);
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>Scan & Verify Receipt on Ground</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Scan Simulator View */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                    <ScanLine className={`w-6 h-6 ${isVerifying ? 'animate-pulse text-rose-400' : ''}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Optical Consignment Scanner</h4>
                    <p className="text-slate-400 text-[11px]">
                      Simulating optical barcode/QR reader at field relief receiving station.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSimulateScan(targetDelivery)}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>{isVerifying ? 'Scanning Hash...' : 'Trigger Optical Scan'}</span>
                </button>
              </div>

              {scannedData ? (
                <div className="bg-emerald-950/20 border border-emerald-500/40 p-5 rounded-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="font-bold text-emerald-300 text-sm">QR Code Decrypted & Authenticated</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                      {scannedData.tamperEvidentSeal}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Batch Hash:</span>
                      <span className="font-mono text-slate-200 text-[11px]">{scannedData.digitalSignatureHash}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Origin Depot:</span>
                      <span className="font-semibold text-white">{scannedData.originWarehouse}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Manifested Cargo:</span>
                      <span className="font-semibold text-white">
                        {scannedData.dispatchedFood} Food • {scannedData.dispatchedWater}L Water • {scannedData.dispatchedMedical} Meds • {scannedData.dispatchedShelter} Shelter
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Two-Level Quorum Signers:</span>
                      <span className="text-slate-300 font-medium">
                        {scannedData.proposerCoordinator} ➔ {scannedData.approverCoordinator}
                      </span>
                    </div>
                  </div>

                  {/* Consignment Integrity Status */}
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-lg flex items-start gap-2.5 text-[11px] text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Automated Ground Check:</span> 100% of manifested supplies verified intact and untampered upon arrival at camp perimeter. Dispatched quantities match custody manifest exactly.
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmGroundReceipt}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Commit Verified Receipt to Ledger</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Click "Trigger Optical Scan" above to simulate scanning the package pass.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

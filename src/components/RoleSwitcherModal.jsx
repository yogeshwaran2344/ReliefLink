import React, { useState } from 'react';
import {
  Shield,
  User,
  Key,
  Lock,
  LogOut,
  CheckCircle2,
  X,
  FileCheck,
  Building2,
  Truck,
  HeartHandshake,
  Crown,
  AlertTriangle,
  History,
  Smartphone,
  Clock
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { currentUser, switchUserRole, addToast } = useRelief();

  // Local state for security settings
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionMinutesLeft, setSessionMinutesLeft] = useState(45);
  const [showPermissionsMatrix, setShowPermissionsMatrix] = useState(false);

  if (!isOpen) return null;

  const roles = [
    {
      id: 'Super Admin',
      name: 'Rohan Deshpande',
      title: 'National Crisis Systems Administrator',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: Crown,
      description: 'Complete platform control, audit logs, configuration, and security management.',
      permissions: ['Complete System Control', 'Override Dual Approvals', 'Manage IAM & Roles', 'Delete & Purge Records', 'Export Audit Transcripts']
    },
    {
      id: 'Disaster Coordinator',
      name: 'Dr. Vikram Malhotra',
      title: 'Disaster Relief Lead Coordinator',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      icon: Shield,
      description: 'Disaster monitoring, resource triage, two-level allocation proposals & approvals.',
      permissions: ['Propose Allocations', 'Dual-Approve Allocations', 'Enact Route Detours', 'Authorize Dispatches', 'Full Operational Command']
    },
    {
      id: 'Warehouse Manager',
      name: 'Ramesh Chawla',
      title: 'Central Depot Logistics Manager',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      icon: Building2,
      description: 'Depot inventory tracking, batch dispatch loading, and inter-depot surplus transfers.',
      permissions: ['Update Warehouse Inventory', 'Approve Inter-Depot Transfers', 'Confirm Dispatches', 'Inspect Batch QR Passes']
    },
    {
      id: 'Transport Manager',
      name: 'Capt. Sunita Rao',
      title: 'Disaster Fleet Operations Director',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
      icon: Truck,
      description: 'Fleet vehicle allocation, driver dispatching, route optimization, and detour monitoring.',
      permissions: ['Assign Vehicles', 'Trigger OR-Tools Routing', 'Toggle Road Hazards & Detours', 'Monitor Driver GPS Latency']
    },
    {
      id: 'Volunteer',
      name: 'Meera Deshmukh',
      title: 'Field Volunteer Representative',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: HeartHandshake,
      description: 'On-ground casualty triage, relief intake request submission, and photo verification.',
      permissions: ['Submit Relief Requests', 'Upload Photo Evidence', 'Verify Ground Receipts', 'Report Damaged Goods']
    },
    {
      id: 'Relief Camp Manager',
      name: 'Anand Kulkarni',
      title: 'Riverbank Shelter Camp Manager',
      badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
      icon: User,
      description: 'Camp population census, requirement requisition submission, and final delivery sign-off.',
      permissions: ['Submit Camp Requisitions', 'Confirm Consignment Delivery', 'Sign Digital QR Delivery Passes']
    }
  ];

  const handleSelectRole = (r) => {
    switchUserRole(r);
    addToast('success', `Session authority updated: ${r.name} (${r.id})`, 'RBAC Authorization');
    onClose();
  };

  const handleToggleMFA = () => {
    setMfaEnabled(!mfaEnabled);
    addToast(mfaEnabled ? 'warning' : 'success', `Multi-Factor Authentication (MFA) ${!mfaEnabled ? 'Enforced' : 'Disabled'} for Administrators.`, 'MFA Security');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[2600] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Enterprise RBAC & Security Authority
                <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30 uppercase">
                  6 Tiered Roles
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Current Active Session: <b className="text-white">{currentUser.name}</b> ({currentUser.role})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Controls Strip (MFA & Session Expiry) */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleMFA}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold border transition ${
                mfaEnabled ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Admin MFA: {mfaEnabled ? 'Active (TOTP Enforced)' : 'Disabled'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Session Expiry: <b className="text-white">{sessionMinutesLeft}m</b></span>
            </div>
          </div>

          <button
            onClick={() => setShowPermissionsMatrix(!showPermissionsMatrix)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] underline"
          >
            {showPermissionsMatrix ? 'Hide Authority Matrix' : 'View Permissions Matrix'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-200 text-xs">
          {showPermissionsMatrix ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Role Authority Matrix:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">Capability</th>
                      <th className="pb-2">Super Admin</th>
                      <th className="pb-2">Coordinator</th>
                      <th className="pb-2">Wh. Mgr</th>
                      <th className="pb-2">Trans. Mgr</th>
                      <th className="pb-2">Volunteer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-2">Propose Allocation</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-slate-600">✗</td>
                      <td className="text-slate-600">✗</td>
                      <td className="text-slate-600">✗</td>
                    </tr>
                    <tr>
                      <td className="py-2">2nd-Level Critical Approval</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓ (Dual)</td>
                      <td className="text-slate-600">✗</td>
                      <td className="text-slate-600">✗</td>
                      <td className="text-slate-600">✗</td>
                    </tr>
                    <tr>
                      <td className="py-2">Inter-Depot Transfers</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-slate-600">✗</td>
                      <td className="text-slate-600">✗</td>
                    </tr>
                    <tr>
                      <td className="py-2">Enact Detour / Hazard</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-slate-600">✗</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-slate-600">✗</td>
                    </tr>
                    <tr>
                      <td className="py-2">Submit & Verify Receipts</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                      <td className="text-emerald-400">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* 6 Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const isCurrent = currentUser?.role === r.id;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-200">
                        <Icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{r.name}</div>
                        <div className="text-[10px] text-slate-400">{r.title}</div>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1">
                    {r.permissions.slice(0, 3).map((perm, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                        {perm}
                      </span>
                    ))}
                    {r.permissions.length > 3 && (
                      <span className="text-[9px] text-slate-500 py-0.5">+{r.permissions.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

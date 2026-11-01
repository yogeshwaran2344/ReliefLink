import React from 'react';
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
  HeartHandshake
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { currentUser, switchUserRole, addToast } = useRelief();

  if (!isOpen) return null;

  const roles = [
    {
      id: 'Coordinator',
      name: 'Dr. Vikram Malhotra',
      title: 'Disaster Relief Coordinator',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      icon: Shield,
      permissions: ['Approve Allocation', 'Triage Requests', 'Enact Route Detours', 'Full Command Access']
    },
    {
      id: 'Warehouse Manager',
      name: 'Ramesh Chawla',
      title: 'Central Depot Logistics Manager',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      icon: Building2,
      permissions: ['Update Warehouse Inventory', 'Approve Inter-Depot Transfers', 'Confirm Dispatches']
    },
    {
      id: 'Field Volunteer',
      name: 'Meera Deshmukh',
      title: 'Camp Volunteer Representative',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: HeartHandshake,
      permissions: ['Submit Relief Requests', 'Upload Photo Evidence', 'Verify Ground Receipts']
    },
    {
      id: 'Fleet Driver',
      name: 'Rajendra Singh',
      title: 'Heavy Truck RL-01 Pilot',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      icon: Truck,
      permissions: ['View Route Sequences', 'Update Transit Checkpoints', 'Report Road Hazards']
    },
    {
      id: 'Admin',
      name: 'Col. R. Sen',
      title: 'Emergency Operations Director',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: Key,
      permissions: ['All Permissions', 'Disaster Scenario Simulator', 'Audit Log Export', 'User Management']
    }
  ];

  const handleSelectRole = (r) => {
    switchUserRole(r);
    addToast('success', `Active session switched to ${r.title} (${r.name}). Role permissions updated!`, 'Security Context');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[3000] flex items-center justify-center p-4 backdrop-blur-md" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-400">Authenticate as different humanitarian actors to test permission barriers.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Session Box */}
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-white">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-bold text-white text-xs">{currentUser?.name}</div>
              <div className="text-[11px] text-slate-400">{currentUser?.email}</div>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded bg-rose-500 text-white font-bold text-[10px] uppercase tracking-wider">
            Active: {currentUser?.role}
          </span>
        </div>

        {/* Select Role */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Role Identity to Switch Session:
          </span>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {roles.map(r => {
              const isCurrent = currentUser?.role === r.id;
              const Icon = r.icon;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRole(r)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500'
                      : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <span>{r.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${r.badgeColor}`}>
                          {r.id}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{r.title}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Perms: {r.permissions.join(', ')}
                      </div>
                    </div>
                  </div>

                  {isCurrent && <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

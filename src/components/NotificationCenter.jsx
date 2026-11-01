import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Boxes,
  Truck,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  Check,
  User,
  ArrowRight,
  Layers
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function NotificationCenter({ isOpen, onClose }) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    addToast
  } = useRelief();

  const [filterCategory, setFilterCategory] = useState('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filterCategory === 'all') return true;
    return (n.category || '').toLowerCase() === filterCategory.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAcknowledge = (id, title) => {
    markNotificationRead(id);
    addToast('success', `Alert acknowledged: "${title.slice(0, 32)}..."`, 'Alert Acknowledged');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[2500] flex justify-end backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-5 space-y-4 animate-slideInRight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-ping">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Smart Alert & Notification Center
              </h3>
              <span className="text-[11px] text-slate-400">
                {unreadCount} unacknowledged operational alarms • Alert Correlation Active
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'critical', label: '🚨 Critical' },
            { id: 'warning', label: '⚠️ Warning' },
            { id: 'operational', label: '🚚 Operational' },
            { id: 'informational', label: 'ℹ️ Informational' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition text-[11px] ${
                filterCategory === tab.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action bar: Mark all read */}
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            Showing {filtered.length} correlated alert events
          </span>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition text-[11px]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledge All</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50 mb-2" />
              <span>No active alerts under this category. All sectors operational.</span>
            </div>
          ) : (
            filtered.map((notif) => {
              const isCrit = (notif.category || '').toUpperCase() === 'CRITICAL';
              const isWarn = (notif.category || '').toUpperCase() === 'WARNING';
              const isOp = (notif.category || '').toUpperCase() === 'OPERATIONAL';
              const isCorrelated = notif.isCorrelated;

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCorrelated
                      ? 'bg-gradient-to-r from-rose-950/50 via-slate-900 to-rose-950/30 border-rose-500 shadow-lg shadow-rose-500/10'
                      : notif.read
                      ? 'bg-slate-900/60 border-slate-800 opacity-75'
                      : isCrit
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : isWarn
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  {/* Correlated Cluster Banner */}
                  {isCorrelated && (
                    <div className="mb-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500 text-white font-mono text-[9px] font-bold uppercase tracking-wider w-fit">
                      <Layers className="w-3 h-3" />
                      <span>Correlated Regional Cluster Event</span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        isWarn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        isOp ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {notif.category}
                      </span>
                      {notif.escalationLevel > 1 && (
                        <span className="text-[9px] bg-red-600/30 text-red-300 border border-red-500/40 px-1.5 py-0.2 rounded font-bold">
                          Escalation Lvl {notif.escalationLevel}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{notif.time || notif.timestamp || 'Just now'}</span>
                  </div>

                  <h4 className="font-bold text-white text-xs mt-1.5">{notif.title}</h4>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">{notif.message}</p>

                  {/* Recommendation action box */}
                  {notif.recommendedAction && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] text-emerald-300">
                      <span className="font-bold text-emerald-400">Recommended Action:</span> {notif.recommendedAction}
                    </div>
                  )}

                  {/* Assignment Pill */}
                  {notif.assignedTo && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>Assigned to: <b className="text-slate-300">{notif.assignedTo}</b></span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                    {notif.targetTab ? (
                      <button
                        onClick={() => {
                          setActiveTab(notif.targetTab);
                          onClose();
                        }}
                        className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <span>Investigate in Module</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : <div />}

                    {!notif.read && (
                      <button
                        onClick={() => handleAcknowledge(notif.id, notif.title)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-750 px-2.5 py-1 rounded text-slate-200 border border-slate-700 flex items-center gap-1"
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

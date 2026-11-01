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
  Check
} from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function NotificationCenter({ isOpen, onClose }) {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useRelief();
  const [filterCategory, setFilterCategory] = useState('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => filterCategory === 'all' || n.category === filterCategory);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/60 z-[2500] flex justify-end backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-5 space-y-4 animate-slideInRight"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Alert & Notification Center</h3>
              <span className="text-[11px] text-slate-400">{unreadCount} active operational alerts</span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
            {['all', 'CRITICAL', 'INVENTORY', 'FLEET', 'AUDIT'].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition ${
                  filterCategory === cat
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              Mark read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
          {filtered.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
              <span>All clear. No unresolved alerts in this category.</span>
            </div>
          ) : (
            filtered.map(item => {
              const isCrit = item.urgency === 'high' || item.category === 'CRITICAL';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    markNotificationRead(item.id);
                    if (item.targetTab) {
                      setActiveTab(item.targetTab);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    !item.read
                      ? isCrit
                        ? 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-950/60'
                        : 'bg-slate-800/90 border-slate-700 hover:bg-slate-800'
                      : 'bg-slate-900/60 border-slate-800/80 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                      item.category === 'CRITICAL' ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' :
                      item.category === 'INVENTORY' ? 'bg-blue-500/30 text-blue-300' :
                      item.category === 'FLEET' ? 'bg-purple-500/30 text-purple-300' :
                      'bg-amber-500/30 text-amber-300'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                  </div>

                  <div className="font-bold text-white text-xs mb-0.5">{item.title}</div>
                  <p className="text-slate-300 text-[11px] leading-snug">{item.message}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800">
                    <span className="text-indigo-400 font-medium">Click to navigate ➔</span>
                    {!item.read && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
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

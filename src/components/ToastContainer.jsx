import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useRelief } from '../context/ReliefContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useRelief();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-slideIn ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-200'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/50 text-amber-200'
                : isError
                ? 'bg-slate-900/95 border-rose-500/50 text-rose-200'
                : 'bg-slate-900/95 border-blue-500/50 text-blue-200'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />}
            {isError && <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              {toast.title && <div className="font-bold uppercase tracking-wider text-[11px] mb-0.5">{toast.title}</div>}
              <div className="text-slate-300 leading-relaxed">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-16 right-5 z-[300] flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((t) => {
        let bgClass = 'bg-blue-50 text-blue-900 border-blue-200';
        let Icon = Info;
        if (t.type === 'success') {
          bgClass = 'bg-emerald-50 text-emerald-900 border-emerald-200';
          Icon = CheckCircle2;
        } else if (t.type === 'error') {
          bgClass = 'bg-red-50 text-red-900 border-red-200';
          Icon = AlertCircle;
        } else if (t.type === 'warning') {
          bgClass = 'bg-amber-50 text-amber-900 border-amber-200';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3 px-4 rounded-xl border shadow-lg text-xs md:text-sm font-medium transition-all duration-300 transform translate-x-0 ${bgClass}`}
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1 leading-snug">{t.msg}</span>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: ToastAction, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'success', 
    action?: ToastAction, 
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, message, type, action, duration };

    setToasts((prev) => [...prev.slice(-2), newToast]); // Keep maximum 3 toasts

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Toast Portal Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-md px-4"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-[#102A20]/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-800/40 flex items-center justify-between gap-3 w-full animate-in slide-in-from-bottom-3 duration-200"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isSuccess && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-400 shrink-0" />}
                {isError && <XCircle size={18} className="text-rose-400 shrink-0" />}
                {!isSuccess && !isWarning && !isError && <Info size={18} className="text-sky-400 shrink-0" />}
                
                <span className="text-[13px] font-semibold leading-tight truncate">
                  {toast.message}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      hideToast(toast.id);
                    }}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}

                <button
                  onClick={() => hideToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                  aria-label="Dismiss toast"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

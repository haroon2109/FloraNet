"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff, Download, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useToast } from '@/context/toastContext';

export default function NetworkStatusIndicator() {
  const { isOnline, pendingCount, isSyncing, triggerSyncNow } = useOfflineSync();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      showToast('FloraNet Sovereign PWA added to Home Screen!', 'success');
    }
  };

  return (
    <div className="flex items-center gap-2">
      
      {/* Pending IndexedDB Outbox Badge with 1-Tap Manual Sync */}
      {pendingCount > 0 && (
        <button
          type="button"
          onClick={triggerSyncNow}
          disabled={isSyncing || !isOnline}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all shadow-xs cursor-pointer ${
            isSyncing
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : isOnline
              ? 'bg-[#EAF5EC] hover:bg-[#DDF0E1] border-[#C4E7D0] text-[#075C32]'
              : 'bg-amber-50 border-amber-300 text-amber-800'
          }`}
          title={isOnline ? 'Click to sync local outbox mutations with regional BRICS node' : 'Queued offline in IndexedDB'}
        >
          {isSyncing ? (
            <RefreshCw size={12} className="animate-spin text-emerald-600 shrink-0" />
          ) : (
            <Zap size={12} className={isOnline ? 'text-[#075C32]' : 'text-amber-600'} />
          )}
          <span>
            {isSyncing ? 'Syncing...' : `${pendingCount} Queued`}
          </span>
        </button>
      )}

      {/* Offline Status Warning Pill */}
      {!isOnline && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-800 rounded-xl text-[11.5px] font-bold shadow-xs">
          <WifiOff size={13} className="text-amber-600 shrink-0" />
          <span className="hidden sm:inline">Offline Mode</span>
        </div>
      )}

      {/* PWA Install Button */}
      {deferredPrompt && !isInstalled && (
        <button
          type="button"
          onClick={handleInstallPWA}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#075C32] hover:bg-[#054324] text-white rounded-xl text-[11.5px] font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
        >
          <Download size={13} className="text-emerald-300" />
          <span>Install App</span>
        </button>
      )}
    </div>
  );
}

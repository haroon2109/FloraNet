"use client";

import React, { useState } from 'react';
import { CheckCircle2, RotateCw, CloudOff } from 'lucide-react';
import { settingsPageData } from '@/data/settingsData';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { useToast } from '@/context/toastContext';

export default function DataSyncStatus() {
  const { syncStatus } = settingsPageData;
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const { showToast } = useToast();

  // Real connectivity check against the backend. We never simulate a
  // successful sync — the status reflects an actual round-trip.
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${getApiBaseUrl()}/`, { signal: controller.signal });
      clearTimeout(timer);
      setReachable(res.ok);
      if (res.ok) {
        setLastSync('Verified just now — backend reachable');
        showToast('FloraNet backend is reachable', 'success');
      } else {
        setLastSync(`Backend responded with HTTP ${res.status}`);
        showToast(`Backend responded with HTTP ${res.status}`, 'warning');
      }
    } catch {
      setReachable(false);
      setLastSync('Backend unreachable — data stays on this device');
      showToast('Backend unreachable', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5 text-center">
      
      {/* Header */}
      <h3 className="text-[15px] font-bold text-[#102A20] mb-3 text-left px-0.5">Data Sync Status</h3>

      {/* Cloud Check Icon */}
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 border ${
        reachable === false
          ? 'bg-[#FFF9F2] text-[#C2410C] border-[#FFE9D4]'
          : 'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]'
      }`}>
        {reachable === false ? <CloudOff size={24} strokeWidth={2.2} /> : <CheckCircle2 size={24} strokeWidth={2.2} />}
      </div>

      {/* Status Text */}
      <h4 className={`text-[14px] font-bold ${reachable === false ? 'text-[#C2410C]' : 'text-[#168A45]'}`}>
        {reachable === false ? 'Offline — device-local data' : syncStatus.statusText}
      </h4>
      <p className="text-[11px] text-[#52645D] mt-0.5 mb-3 font-medium">
        {lastSync ?? 'Run a connection check to verify backend reachability'}
      </p>

      {/* Sync Button */}
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-[#E1E7E3] hover:border-[#C4E7D0] hover:bg-[#F5F9F6] text-[12px] font-bold text-[#102A20] rounded-xl transition-all shadow-xs disabled:opacity-50"
      >
        <span>{isSyncing ? 'Checking…' : 'Check Connection'}</span>
        <RotateCw size={13} className={`text-[#168A45] ${isSyncing ? 'animate-spin' : ''}`} />
      </button>

    </div>
  );
}

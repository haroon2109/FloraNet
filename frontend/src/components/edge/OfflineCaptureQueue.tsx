"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  CloudOff,
  Loader2,
  Mic,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  CAPTURES_CHANGED_EVENT,
  getPendingCaptures,
  removePendingCapture,
  type PendingCapture,
} from '@/lib/offlineDb';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { useToast } from '@/context/toastContext';
import { chatLanguageName } from '@/lib/speech';
import { useUILocale } from '@/lib/useUILocale';
import type { LiveDiagnosis } from '@/components/field-monitor/EdgeDiagnosticsCard';

/**
 * Offline Capture Queue — FloraNet Edge
 *
 * Renders the farmer's leaf photos & voice notes queued in IndexedDB while the
 * device had no connectivity, then replays them through the real pipelines the
 * moment connectivity returns (auto-sync on the `online` event, on mount, and
 * whenever another surface queues a new capture):
 *   - photos  → POST /api/v1/doctor/diagnose (multipart) → poll /api/v1/tasks/{id}
 *   - voice   → POST /api/v1/audio/transcribe (multipart, local faster-whisper)
 *
 * No simulated uploads: an item leaves the queue only after a confirmed HTTP
 * success AND a real result; failures stay queued for retry.
 */

export interface CaptureReplayResult {
  kind: 'photo' | 'voice';
  capture: PendingCapture;
  diagnosis?: LiveDiagnosis;
  transcript?: string;
}

export interface OfflineCaptureQueueProps {
  /** Receives every successful replay result so the page can render it. */
  onResult?: (result: CaptureReplayResult) => void;
}

/** Rebuild a Blob from a stored base64 data URL (tolerates a bare base64 payload). */
function dataUrlToBlob(dataUrl: string, fallbackMime: string): Blob {
  const commaIndex = dataUrl.indexOf(',');
  const meta = commaIndex >= 0 ? dataUrl.slice(0, commaIndex) : '';
  const payload = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  const mime = /:(.*?);/.exec(meta)?.[1] || fallbackMime || 'application/octet-stream';

  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Poll the Celery/inline task store until the diagnosis task resolves. */
async function pollDiagnosisTask(taskId: string): Promise<LiveDiagnosis> {
  const base = getApiBaseUrl();
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(`${base}/api/v1/tasks/${encodeURIComponent(taskId)}`);
    if (!res.ok) continue;
    const body = await res.json();
    if (body?.status === 'SUCCESS' && body?.result) return body.result as LiveDiagnosis;
    if (body?.status === 'FAILURE') {
      throw new Error(typeof body?.result === 'string' ? body.result : 'Diagnosis task failed');
    }
  }
  throw new Error('Diagnosis timed out — the local model server may be busy.');
}

export default function OfflineCaptureQueue({ onResult }: OfflineCaptureQueueProps = {}) {
  const { showToast } = useToast();
  // Queue timestamps render in the farmer's chosen language.
  const locale = useUILocale();
  const [captures, setCaptures] = useState<PendingCapture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  // Guards against the reconnect handler and the mount effect flushing the
  // same batch concurrently.
  const syncingRef = useRef(false);

  const refresh = useCallback(async () => {
    const items = await getPendingCaptures();
    items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    setCaptures(items);
    setIsLoading(false);
    return items;
  }, []);

  /** Replay one queued capture through its real backend endpoint. */
  const replayOne = useCallback(async (item: PendingCapture): Promise<CaptureReplayResult> => {
    const blob = dataUrlToBlob(item.dataB64, item.mime);
    const base = getApiBaseUrl();

    if (item.kind === 'photo') {
      const form = new FormData();
      form.append('image', new File([blob], item.name || 'leaf.jpg', { type: item.mime || 'image/jpeg' }));
      form.append(
        'query',
        // `item.language` is a BCP-47 locale (for Whisper) — the diagnosis
        // prompt needs the display name the model can actually follow.
        `Diagnose crop disease or deficiency in this leaf sample (${item.crop || 'unknown crop'}, ${item.country || 'unknown country'}). Reply in ${chatLanguageName(item.language)}.`,
      );
      form.append('coordinates', item.coords || '');

      const res = await fetch(`${base}/api/v1/doctor/diagnose`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Diagnose rejected (HTTP ${res.status}).`);
      const { task_id } = await res.json();
      if (!task_id) throw new Error('Backend did not return a task id.');
      const diagnosis = await pollDiagnosisTask(task_id);
      return { kind: 'photo', capture: item, diagnosis };
    }

    const ext = (item.mime || '').includes('webm') ? 'webm' : 'ogg';
    const form = new FormData();
    form.append('file', new File([blob], item.name || `voice-note.${ext}`, { type: item.mime || 'audio/webm' }));
    form.append('language', item.language || 'en-US');

    const res = await fetch(`${base}/api/v1/audio/transcribe`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Transcription rejected (HTTP ${res.status}).`);
    const data = await res.json();
    return { kind: 'voice', capture: item, transcript: String(data.transcript ?? '') };
  }, []);

  /** Upload every queued capture; keep the ones the backend rejected. */
  const syncAll = useCallback(
    async (silent = false) => {
      if (syncingRef.current) return;
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        if (!silent) showToast('Still offline — captures stay queued on this device.', 'warning');
        return;
      }

      const items = await refresh();
      if (items.length === 0) {
        if (!silent) showToast('Nothing queued — all field captures are already synced.', 'info');
        return;
      }

      syncingRef.current = true;
      setIsSyncing(true);
      let synced = 0;
      let failed = 0;

      for (const item of items) {
        setActiveId(item.id);
        try {
          const result = await replayOne(item);
          await removePendingCapture(item.id);
          synced += 1;
          onResult?.(result);
        } catch {
          // Keep queued — a real retry happens on the next sync.
          failed += 1;
        }
      }

      setActiveId(null);
      setIsSyncing(false);
      syncingRef.current = false;
      await refresh();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CAPTURES_CHANGED_EVENT));
      }

      if (synced > 0) {
        showToast(
          `Synced ${synced} queued capture${synced === 1 ? '' : 's'} to the FloraNet backend${failed > 0 ? ` — ${failed} still queued` : ''}`,
          failed > 0 ? 'warning' : 'success',
        );
      } else if (failed > 0) {
        showToast('No queued captures could be synced — the backend rejected them. They stay queued.', 'error');
      }
    },
    [onResult, refresh, replayOne, showToast],
  );

  // Re-read the queue whenever a capture is added elsewhere, and auto-sync
  // once the device reports it is back online.
  useEffect(() => {
    void (async () => {
      const items = await refresh();
      if (items.length > 0 && (typeof navigator === 'undefined' || navigator.onLine)) {
        void syncAll(true);
      }
    })();

    const onCapturesChanged = () => {
      void (async () => {
        const items = await refresh();
        if (items.length > 0 && (typeof navigator === 'undefined' || navigator.onLine)) {
          void syncAll(true);
        }
      })();
    };

    const goOnline = () => {
      setOnline(true);
      // Auto-sync the moment connectivity is restored.
      void syncAll(true);
    };
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener(CAPTURES_CHANGED_EVENT, onCapturesChanged);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener(CAPTURES_CHANGED_EVENT, onCapturesChanged);
    };
  }, [refresh, syncAll]);

  const discard = async (id: string) => {
    await removePendingCapture(id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CAPTURES_CHANGED_EVENT));
    }
    await refresh();
    showToast('Queued capture discarded', 'info');
  };

  const queuedBytes = captures.reduce((sum, item) => sum + (item.dataB64?.length || 0), 0);
  const formatBytes = (n: number) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EAF6EE] border border-[#CDE5D5] flex items-center justify-center shrink-0">
            <Camera size={19} className="text-[#075C32]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[16px] font-bold text-[#102A20] leading-tight">Offline Capture Queue</h3>
              {captures.length > 0 && (
                <span className="text-[10.5px] font-bold text-[#075C32] bg-[#EAF6EE] border border-[#CDE5D5] px-1.5 py-0.5 rounded">
                  {captures.length} queued · {formatBytes(queuedBytes)}
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-[#55695F] mt-0.5">
              Photos &amp; voice notes captured in the field, queued in IndexedDB and auto-synced the moment you reconnect.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              online
                ? 'text-[#15803D] bg-[#F0FDF4] border-[#DCFCE7]'
                : 'text-[#C2410C] bg-[#FFF9F2] border-[#FFE9D4]'
            }`}
          >
            {online ? <Wifi size={12} /> : <WifiOff size={12} />}
            {online ? 'Online' : 'Offline'}
          </span>
          <button
            type="button"
            onClick={() => void syncAll()}
            disabled={isSyncing || captures.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#075C32] hover:bg-[#064E2A] text-white text-[12px] font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Uploading…' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!isLoading && captures.length === 0 && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#E1E8E4] bg-[#FAFCFA]">
          <CheckCircle2 size={15} className="text-[#15803D] shrink-0" />
          <p className="text-[13px] font-semibold text-[#55695F]">
            No queued captures. Photos and voice notes taken while offline will appear here automatically.
          </p>
        </div>
      )}

      {/* Queue list */}
      {captures.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {captures.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-[#E1E8E4] bg-[#FDFEFD] p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-[#F1F5F3] border border-[#E1E8E4] flex items-center justify-center shrink-0 overflow-hidden">
                {activeId === item.id ? (
                  <Loader2 size={17} className="text-[#075C32] animate-spin" />
                ) : item.kind === 'photo' ? (
                  <Camera size={17} className="text-[#6D8176]" />
                ) : (
                  <Mic size={17} className="text-[#6D8176]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#102A20] truncate">
                  {item.name || (item.kind === 'photo' ? 'Leaf photo' : 'Voice note')}
                </p>
                <p className="text-[11px] text-[#6D8176] font-medium">
                  {item.kind === 'photo' ? 'Queued for disease diagnosis' : 'Queued for local transcription'} · {new Date(item.createdAt).toLocaleString(locale)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void discard(item.id)}
                className="p-2 rounded-lg text-[#889B91] hover:text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                aria-label="Discard queued capture"
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!online && captures.length > 0 && (
        <p className="flex items-center gap-2 text-[11.5px] text-[#C2410C] font-medium mt-3">
          <CloudOff size={13} />
          You are offline — captures stay queued until connectivity is restored.
        </p>
      )}
    </div>
  );
}

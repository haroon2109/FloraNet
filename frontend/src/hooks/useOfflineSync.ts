"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  getPendingOutboxItems, 
  updateOutboxItemStatus, 
  removeSyncedOutboxItem, 
  getOutboxCount,
  OutboxItem
} from '@/lib/offlineDb';
import { getApiBaseUrl } from '@/lib/apiConfig';
import { useToast } from '@/context/toastContext';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { showToast } = useToast();

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getOutboxCount();
      setPendingCount(count);
    } catch {
      setPendingCount(0);
    }
  }, []);

  const flushOutboxQueue = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;

    const pending = await getPendingOutboxItems();
    if (pending.length === 0) {
      setPendingCount(0);
      return;
    }

    setIsSyncing(true);
    let successCount = 0;

    for (const item of pending) {
      try {
        await updateOutboxItemStatus(item.id, 'syncing');
        const url = `${getApiBaseUrl()}${item.endpoint}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
          signal: AbortSignal.timeout(6000),
        });

        if (response.ok) {
          await removeSyncedOutboxItem(item.id);
          successCount++;
        } else {
          await updateOutboxItemStatus(item.id, 'failed', true);
        }
      } catch (err) {
        await updateOutboxItemStatus(item.id, 'failed', true);
      }
    }

    setIsSyncing(false);
    await refreshPendingCount();

    if (successCount > 0) {
      showToast(`Synced ${successCount} offline field mutation${successCount > 1 ? 's' : ''} with regional node`, 'success');
    }
  }, [isSyncing, refreshPendingCount, showToast]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back online · Flushing local field outbox queue...', 'info');
      flushOutboxQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode: All farm actions will be safely queued in IndexedDB', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check every 15s to retry failed or queued actions
    const interval = setInterval(() => {
      refreshPendingCount();
      if (navigator.onLine) {
        flushOutboxQueue();
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [flushOutboxQueue, refreshPendingCount, showToast]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    triggerSyncNow: flushOutboxQueue,
    refreshPendingCount,
  };
}

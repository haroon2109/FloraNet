/**
 * FloraNet Sovereign Offline IndexedDB Engine
 * Local-First storage & Background Sync Outbox for low-connectivity agricultural field operations.
 */

export interface OutboxItem {
  id: string;
  action: 'TOGGLE_IRRIGATION' | 'RESOLVE_ALERT' | 'APPLY_RECOMMENDATION' | 'REGISTER_USER' | 'LOG_FIELD_EVENT' | string;
  endpoint: string;
  payload: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

export interface CachedTelemetryItem {
  key: string;
  data: any;
  updatedAt: string;
}

const DB_NAME = 'floranet_offline_v1';
const DB_VERSION = 1;

export interface PendingCapture {
  id: string;
  kind: 'photo' | 'voice';
  name: string;
  mime: string;
  dataB64: string;
  coords: string;
  language: string;
  crop: string;
  country: string;
  createdAt: string;
}

/**
 * Queue a raw leaf photo / voice blob taken while offline (base64 data URL payload).
 * Capture operations reuse the shared `openDB()` opener so the schema has one
 * single source of truth.
 */
export async function queuePendingCapture(item: Omit<PendingCapture, 'id' | 'createdAt'>): Promise<PendingCapture> {
  const db = await openDB();

  const full: PendingCapture = {
    ...item,
    id: `cap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CAPTURES, 'readwrite');
    const store = tx.objectStore(STORES.CAPTURES);
    const request = store.put(full);
    request.onsuccess = () => resolve(full);
    request.onerror = () => reject(request.error);
  });
}

/** List queued offline captures awaiting upload. */
export async function getPendingCaptures(): Promise<PendingCapture[]> {
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(STORES.CAPTURES)) return [];
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CAPTURES, 'readonly');
      const store = tx.objectStore(STORES.CAPTURES);
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result || []) as PendingCapture[]);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/** Remove a capture once it has been successfully uploaded. */
export async function removePendingCapture(id: string): Promise<void> {
  const db = await openDB();
  if (!db.objectStoreNames.contains(STORES.CAPTURES)) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CAPTURES, 'readwrite');
    const store = tx.objectStore(STORES.CAPTURES);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

const STORES = {
  OUTBOX: 'sync_outbox',
  TELEMETRY: 'telemetry_store',
  KNOWLEDGE: 'knowledge_cache',
  CAPTURES: 'pending_captures',
};

/**
 * Window event dispatched whenever the pending-capture set changes (a capture
 * was queued or uploaded). Lets the UI re-read the queue without polling.
 */
export const CAPTURES_CHANGED_EVENT = 'floranet:captures-changed';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Sync Outbox Queue
      if (!db.objectStoreNames.contains(STORES.OUTBOX)) {
        const outboxStore = db.createObjectStore(STORES.OUTBOX, { keyPath: 'id' });
        outboxStore.createIndex('status', 'status', { unique: false });
        outboxStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // 2. Offline Telemetry Cache Store
      if (!db.objectStoreNames.contains(STORES.TELEMETRY)) {
        db.createObjectStore(STORES.TELEMETRY, { keyPath: 'key' });
      }

      // 3. RAG Knowledge & Commodity Cache
      if (!db.objectStoreNames.contains(STORES.KNOWLEDGE)) {
        db.createObjectStore(STORES.KNOWLEDGE, { keyPath: 'key' });
      }

      // 4. Offline Field Captures (leaf photos + voice notes awaiting upload)
      if (!db.objectStoreNames.contains(STORES.CAPTURES)) {
        db.createObjectStore(STORES.CAPTURES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      // Installs created before captures existed are already at DB_VERSION and
      // will never fire onupgradeneeded again — bump once to add the store.
      if (!db.objectStoreNames.contains(STORES.CAPTURES)) {
        const nextVersion = db.version + 1;
        db.close();
        const upgrade = window.indexedDB.open(DB_NAME, nextVersion);
        upgrade.onupgradeneeded = (ev) => {
          const upgraded = (ev.target as IDBOpenDBRequest).result;
          if (!upgraded.objectStoreNames.contains(STORES.CAPTURES)) {
            upgraded.createObjectStore(STORES.CAPTURES, { keyPath: 'id' });
          }
        };
        upgrade.onsuccess = () => resolve(upgrade.result);
        upgrade.onerror = () => reject(upgrade.error);
        return;
      }
      resolve(db);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Queue a mutation when offline or execute optimistically
 */
export async function queueOfflineMutation(
  action: string,
  endpoint: string,
  payload: any
): Promise<OutboxItem> {
  const db = await openDB();
  const item: OutboxItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    endpoint,
    payload,
    timestamp: new Date().toISOString(),
    status: 'pending',
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OUTBOX, 'readwrite');
    const store = tx.objectStore(STORES.OUTBOX);
    const request = store.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all pending items in outbox queue
 */
export async function getPendingOutboxItems(): Promise<OutboxItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.OUTBOX, 'readonly');
      const store = tx.objectStore(STORES.OUTBOX);
      const request = store.getAll();

      request.onsuccess = () => {
        const items: OutboxItem[] = request.result || [];
        resolve(items.filter(i => i.status === 'pending' || i.status === 'failed'));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return [];
  }
}

/**
 * Update outbox item status
 */
export async function updateOutboxItemStatus(
  id: string,
  status: OutboxItem['status'],
  incrementRetry = false
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OUTBOX, 'readwrite');
    const store = tx.objectStore(STORES.OUTBOX);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item: OutboxItem = getReq.result;
      if (!item) {
        resolve();
        return;
      }
      item.status = status;
      if (incrementRetry) item.retryCount += 1;
      const putReq = store.put(item);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Remove synced items from queue
 */
export async function removeSyncedOutboxItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.OUTBOX, 'readwrite');
    const store = tx.objectStore(STORES.OUTBOX);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache telemetry locally in IndexedDB
 */
export async function cacheTelemetryLocally(key: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    const item: CachedTelemetryItem = {
      key,
      data,
      updatedAt: new Date().toISOString(),
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TELEMETRY, 'readwrite');
      const store = tx.objectStore(STORES.TELEMETRY);
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[FloraNet IndexedDB] Failed to cache telemetry:', err);
  }
}

/**
 * Retrieve cached telemetry from IndexedDB
 */
export async function getCachedTelemetry<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TELEMETRY, 'readonly');
      const store = tx.objectStore(STORES.TELEMETRY);
      const request = store.get(key);
      request.onsuccess = () => {
        const item: CachedTelemetryItem = request.result;
        resolve(item ? (item.data as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Get total pending outbox count
 */
export async function getOutboxCount(): Promise<number> {
  const items = await getPendingOutboxItems();
  return items.length;
}

/**
 * Flush the offline outbox: POST every pending/failed queued mutation to its
 * real backend endpoint. Returns the number of items successfully synced.
 * Items that fail keep their queue entry (status 'failed', retryCount + 1).
 */
export async function flushOutbox(): Promise<number> {
  const items = await getPendingOutboxItems();
  if (items.length === 0) return 0;

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7880';
  let flushed = 0;

  for (const item of items) {
    await updateOutboxItemStatus(item.id, 'syncing');
    try {
      const res = await fetch(`${BACKEND_URL}${item.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await removeSyncedOutboxItem(item.id);
      flushed += 1;
    } catch (err) {
      await updateOutboxItemStatus(item.id, 'failed', true);
    }
  }

  return flushed;
}

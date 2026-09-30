import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface FloraNetDB extends DBSchema {
  diagnosisQueue: {
    key: number;
    value: {
      id?: number;
      timestamp: string;
      payload: any; // The diagnosis payload
      status: 'pending' | 'syncing' | 'failed';
    };
    indexes: { 'by-status': string };
  };
}

let dbPromise: Promise<IDBPDatabase<FloraNetDB>> | null = null;

export const initDB = () => {
  if (typeof window === 'undefined') return null;
  
  if (!dbPromise) {
    dbPromise = openDB<FloraNetDB>('floranet-offline-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('diagnosisQueue', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('by-status', 'status');
      },
    });
  }
  return dbPromise;
};

export const enqueueDiagnosis = async (payload: any) => {
  const db = await initDB();
  if (!db) return;

  await db.add('diagnosisQueue', {
    timestamp: new Date().toISOString(),
    payload,
    status: 'pending',
  });
};

export const getPendingDiagnoses = async () => {
  const db = await initDB();
  if (!db) return [];
  return db.getAllFromIndex('diagnosisQueue', 'by-status', 'pending');
};

export const markAsSyncing = async (id: number) => {
  const db = await initDB();
  if (!db) return;
  const item = await db.get('diagnosisQueue', id);
  if (item) {
    item.status = 'syncing';
    await db.put('diagnosisQueue', item);
  }
};

export const removeSyncedDiagnosis = async (id: number) => {
  const db = await initDB();
  if (!db) return;
  await db.delete('diagnosisQueue', id);
};

export const syncOfflineData = async (apiEndpoint: string) => {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  const pendingItems = await getPendingDiagnoses();
  if (pendingItems.length === 0) return;

  for (const item of pendingItems) {
    if (!item.id) continue;
    
    try {
      await markAsSyncing(item.id);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.payload),
      });

      if (response.ok) {
        await removeSyncedDiagnosis(item.id);
      } else {
        // Revert to pending on failure
        const db = await initDB();
        if (db) {
          item.status = 'pending';
          await db.put('diagnosisQueue', item);
        }
      }
    } catch (error) {
      console.error('Failed to sync offline item', error);
      // Revert to pending
      const db = await initDB();
      if (db) {
        item.status = 'pending';
        await db.put('diagnosisQueue', item);
      }
    }
  }
};

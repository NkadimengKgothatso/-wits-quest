/**
 * Offline Queue — IndexedDB-based queue for trivia check-ins.
 * 
 * How it works:
 *   1. When the user answers a trivia question, the check-in is recorded here.
 *   2. If the device is offline, the action is saved to IndexedDB instead of
 *      being sent to the server immediately.
 *   3. When connectivity returns, processQueue() replays every saved action
 *      in order and removes them from the queue.
 * 
 * IndexedDB structure:
 *   Database: "wits_quest_offline"
 *   Store:    "trivia_queue"
 *   Each record: { id, userId, landmarkId, cardId, answer, timestamp }
 */

const DB_NAME = 'wits_quest_offline';
const DB_VERSION = 1;
const STORE_NAME = 'trivia_queue';

export interface TriviaCheckIn {
  id: string;
  userId: string;
  landmarkId: string;
  cardId: string;
  answer: string;
  timestamp: string;
}

/**
 * Open (or create) the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Use auto-increment key so each entry gets a unique numeric ID
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Add a trivia check-in to the offline queue.
 * Called when the user answers a trivia question while offline.
 */
export async function enqueueCheckIn(checkIn: Omit<TriviaCheckIn, 'id'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add(checkIn);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get all pending check-ins from the queue, ordered by insertion.
 */
export async function getAllCheckIns(): Promise<TriviaCheckIn[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as TriviaCheckIn[]);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Remove a single check-in by its ID (after successful sync).
 */
export async function removeCheckIn(id: string | number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id as any);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get the count of pending offline check-ins.
 */
export async function getQueueCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Process the entire offline queue:
 *   - For each pending check-in, POST to the backend.
 *   - On success, remove from the queue.
 *   - On failure, stop processing (will retry next time online).
 * 
 * Returns the number of successfully synced check-ins.
 */
export async function processQueue(authToken: string | null): Promise<number> {
  const items = await getAllCheckIns();
  if (items.length === 0) return 0;

  let synced = 0;

  for (const item of items) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/trivia/checkin`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: item.userId,
          landmarkId: item.landmarkId,
          cardId: item.cardId,
          answer: item.answer,
          timestamp: item.timestamp,
        }),
      });

      if (res.ok) {
        await removeCheckIn(item.id);
        synced++;
        console.log(`[OfflineQueue] Synced check-in ${item.id} for user ${item.userId}`);
      } else {
        // Server rejected it — skip and move on
        console.warn(`[OfflineQueue] Server rejected check-in ${item.id}:`, await res.text());
        await removeCheckIn(item.id);
      }
    } catch {
      // Network still down — stop processing, will retry later
      console.log(`[OfflineQueue] Network still offline, stopping queue processing at item ${item.id}`);
      break;
    }
  }

  if (synced > 0) {
    console.log(`[OfflineQueue] Successfully synced ${synced}/${items.length} check-ins`);
  }

  return synced;
}

/**
 * Clear the entire queue (for logout or debugging).
 */
export async function clearQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

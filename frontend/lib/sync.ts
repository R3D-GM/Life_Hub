import { db, TABLE_BY_ENTITY } from "./db";
import { api } from "./api";

let syncing = false;

export async function runSync() {
  if (syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  syncing = true;
  try {
    const pending = await db.syncQueue.where("status").equals("pending").sortBy("createdAt");
    if (pending.length === 0) return;

    const ops = pending.map((item) => ({
      entityType: item.entityType,
      operation: item.operation,
      clientId: item.clientId,
      payload: item.payload,
    }));

    const { results } = await api.post<{
      results: { clientId: string; entityType: string; status: string; serverId?: string; error?: string }[];
    }>("/api/sync", { ops });

    for (const result of results) {
      const queueItem = pending.find((p) => p.clientId === result.clientId && p.entityType === result.entityType);
      if (!queueItem?.id) continue;

      if (result.status === "ok") {
        // Attach the real server id to the local record, then clear the queue entry
        const table = TABLE_BY_ENTITY[result.entityType];
        if (table && result.serverId) {
          const local = await table.get(result.clientId);
          if (local) await table.put({ ...local, serverId: result.serverId, _pendingSync: false });
        }
        await db.syncQueue.delete(queueItem.id);
      } else {
        await db.syncQueue.update(queueItem.id, {
          status: "failed",
          retryCount: queueItem.retryCount + 1,
        });
      }
    }
  } catch {
    // network/server error - leave items pending, next trigger will retry
  } finally {
    syncing = false;
  }
}

/** Call once on app start: syncs on load, on reconnect, and periodically
 * while the tab is open (simple polling in place of full background-sync
 * service worker support, which is added in the PWA phase). */
export function startSyncEngine() {
  if (typeof window === "undefined") return;
  runSync();
  window.addEventListener("online", runSync);
  setInterval(runSync, 15000);
}

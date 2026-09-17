import Dexie, { type Table } from "dexie";

export interface LocalRecord {
  clientId: string;
  serverId?: string;
  [key: string]: unknown;
}

export interface SyncQueueItem {
  id?: number;
  entityType: string;
  operation: "create" | "update" | "delete";
  clientId: string;
  payload?: Record<string, unknown>;
  status: "pending" | "syncing" | "failed";
  retryCount: number;
  createdAt: number;
}

class LifeHubDB extends Dexie {
  sleep!: Table<LocalRecord, string>;
  water!: Table<LocalRecord, string>;
  movement!: Table<LocalRecord, string>;
  nutrition!: Table<LocalRecord, string>;
  habits!: Table<LocalRecord, string>;
  habitCompletions!: Table<LocalRecord, string>;
  goals!: Table<LocalRecord, string>;
  skills!: Table<LocalRecord, string>;
  learningSessions!: Table<LocalRecord, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super("lifehub");
    this.version(1).stores({
      sleep: "clientId",
      water: "clientId",
      movement: "clientId",
      nutrition: "clientId",
      habits: "clientId",
      habitCompletions: "clientId",
      goals: "clientId",
      skills: "clientId",
      learningSessions: "clientId",
      syncQueue: "++id, status, clientId",
    });
  }
}

export const db = new LifeHubDB();

// entityType (as understood by the backend /api/sync endpoint) -> local table
export const TABLE_BY_ENTITY: Record<string, Table<LocalRecord, string>> = {
  sleep: db.sleep,
  water: db.water,
  movement: db.movement,
  nutrition: db.nutrition,
  habit: db.habits,
  habitCompletion: db.habitCompletions,
  goal: db.goals,
  skill: db.skills,
  learningSession: db.learningSessions,
};

export function newClientId() {
  return crypto.randomUUID();
}

/** Write locally first (optimistic), then queue for sync. This is the core
 * offline-first pattern used by every "log" action in the app. */
export async function logLocally(entityType: string, payload: Record<string, unknown>) {
  const clientId = newClientId();
  const table = TABLE_BY_ENTITY[entityType];
  const record: LocalRecord = { clientId, ...payload, _pendingSync: true };
  await table.put(record);
  await db.syncQueue.add({
    entityType,
    operation: "create",
    clientId,
    payload,
    status: "pending",
    retryCount: 0,
    createdAt: Date.now(),
  });
  return clientId;
}

import { updateEntity, softDeleteEntity } from "../../lib/syncableEntity";
import { AppError } from "../../lib/AppError";
import * as health from "../health/service";
import * as finance from "../finance/service";
import * as habits from "../habits/service";
import * as goals from "../goals/service";
import * as learning from "../learning/service";
import * as university from "../university/service";

const TABLE_BY_ENTITY: Record<string, string> = {
  sleep: "SleepEntry",
  water: "WaterEntry",
  movement: "MovementEntry",
  nutrition: "NutritionEntry",
  account: "Account",
  transaction: "Transaction",
  habit: "Habit",
  habitCompletion: "HabitCompletion",
  goal: "Goal",
  goalMilestone: "GoalMilestone",
  skill: "Skill",
  learningSession: "LearningSession",
  courseTask: "CourseTask",
};

// entityType -> create function that already does clientId-based idempotent insert
const CREATE_HANDLERS: Record<string, (userId: string, payload: any) => Promise<unknown>> = {
  sleep: (userId, p) => health.createSleepEntry(userId, p),
  water: (userId, p) => health.createWater(userId, p),
  movement: (userId, p) => health.createMovement(userId, p),
  nutrition: (userId, p) => health.createNutrition(userId, p),
  account: (userId, p) => finance.createAccount(userId, p),
  transaction: (userId, p) => finance.createTransaction(userId, p),
  habit: (userId, p) => habits.createHabit(userId, p),
  habitCompletion: (userId, p) => habits.completeHabit(userId, p),
  goal: (userId, p) => goals.createGoal(userId, p),
  goalMilestone: (userId, p) => goals.createMilestone(userId, p),
  skill: (userId, p) => learning.createSkill(userId, p),
  learningSession: (userId, p) => learning.createLearningSession(userId, p),
  courseTask: (userId, p) => university.createTask(userId, p),
};

export interface SyncOp {
  entityType: string;
  operation: "create" | "update" | "delete";
  clientId: string;
  payload?: Record<string, unknown>;
}

export interface SyncResult {
  clientId: string;
  entityType: string;
  status: "ok" | "error";
  serverId?: string;
  error?: string;
}

export async function applySyncOps(userId: string, ops: SyncOp[]): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  // Applied in order so parent records (e.g. a habit before its completions) sync first.
  for (const op of ops) {
    try {
      const table = TABLE_BY_ENTITY[op.entityType];
      if (!table) throw new AppError(400, `Unknown entityType: ${op.entityType}`);

      let row: any;
      if (op.operation === "create") {
        const createFn = CREATE_HANDLERS[op.entityType];
        if (!createFn) throw new AppError(400, `Create not supported for ${op.entityType}`);
        row = await createFn(userId, { clientId: op.clientId, ...op.payload });
      } else if (op.operation === "update") {
        row = await updateEntity(table, userId, op.clientId, op.payload || {});
      } else {
        row = await softDeleteEntity(table, userId, op.clientId);
      }
      results.push({ clientId: op.clientId, entityType: op.entityType, status: "ok", serverId: row.id });
    } catch (err) {
      const message = err instanceof AppError ? err.message : "Sync failed for this item";
      results.push({ clientId: op.clientId, entityType: op.entityType, status: "error", error: message });
    }
  }
  return results;
}

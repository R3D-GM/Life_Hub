import { pool } from "../../lib/db";
import { insertEntity, listEntities, updateEntity, softDeleteEntity } from "../../lib/syncableEntity";
import { AppError } from "../../lib/AppError";

export const createGoal = (
  userId: string,
  input: { clientId: string; category: string; name: string; progressPercent?: number }
) =>
  insertEntity("Goal", userId, input.clientId, {
    category: input.category,
    name: input.name,
    progressPercent: input.progressPercent ?? 0,
  });

export const updateGoalProgress = (userId: string, clientId: string, progressPercent: number) =>
  updateEntity("Goal", userId, clientId, { progressPercent });

export const deleteGoal = (userId: string, clientId: string) => softDeleteEntity("Goal", userId, clientId);

async function assertOwnsGoal(userId: string, goalId: string) {
  const result = await pool.query(
    'SELECT id FROM "Goal" WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL',
    [goalId, userId]
  );
  if (!result.rows[0]) throw new AppError(404, "Goal not found");
}

export const createMilestone = async (
  userId: string,
  input: { clientId: string; goalId: string; name: string; completed?: boolean; order?: number }
) => {
  await assertOwnsGoal(userId, input.goalId);
  return insertEntity("GoalMilestone", userId, input.clientId, {
    goalId: input.goalId,
    name: input.name,
    completed: input.completed ?? false,
    order: input.order ?? 0,
  });
};

export const toggleMilestone = (userId: string, clientId: string, completed: boolean) =>
  updateEntity("GoalMilestone", userId, clientId, { completed });

export async function listGoalsWithMilestones(userId: string) {
  const goals = await listEntities("Goal", userId, { orderBy: "createdAt" });
  const result = await pool.query(
    `SELECT * FROM "GoalMilestone" WHERE "userId" = $1 AND "deletedAt" IS NULL ORDER BY "order" ASC`,
    [userId]
  );
  const milestonesByGoal: Record<string, unknown[]> = {};
  for (const m of result.rows) {
    (milestonesByGoal[m.goalId] ||= []).push(m);
  }
  return goals.map((g) => ({ ...g, milestones: milestonesByGoal[g.id] || [] }));
}

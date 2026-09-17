import { pool } from "../../lib/db";
import { insertEntity, listEntities, softDeleteEntity } from "../../lib/syncableEntity";
import { AppError } from "../../lib/AppError";

export const createHabit = (userId: string, input: { clientId: string; name: string; frequency: string }) =>
  insertEntity("Habit", userId, input.clientId, { name: input.name, frequency: input.frequency });

export const listHabits = (userId: string) => listEntities("Habit", userId, { orderBy: "createdAt" });
export const deleteHabit = (userId: string, clientId: string) => softDeleteEntity("Habit", userId, clientId);

async function assertOwnsHabit(userId: string, habitId: string) {
  const result = await pool.query(
    'SELECT id, frequency FROM "Habit" WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL',
    [habitId, userId]
  );
  if (!result.rows[0]) throw new AppError(404, "Habit not found");
  return result.rows[0];
}

export async function completeHabit(
  userId: string,
  input: { clientId: string; habitId: string; date: string; completed?: boolean }
) {
  await assertOwnsHabit(userId, input.habitId);
  return insertEntity("HabitCompletion", userId, input.clientId, {
    habitId: input.habitId,
    date: input.date,
    completed: input.completed ?? true,
  });
}

function toDayString(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Streak = consecutive days (daily habits) or consecutive weeks (weekly habits)
 * of completion, walking backward from today. Broken by any gap. */
export async function getHabitStreak(userId: string, habitId: string) {
  const habit = await assertOwnsHabit(userId, habitId);
  const result = await pool.query(
    `SELECT date FROM "HabitCompletion"
     WHERE "userId" = $1 AND "habitId" = $2 AND completed = true AND "deletedAt" IS NULL
     ORDER BY date DESC`,
    [userId, habitId]
  );
  const completedDays = new Set(result.rows.map((r) => toDayString(new Date(r.date))));

  let streak = 0;
  const cursor = new Date();
  const stepDays = habit.frequency === "weekly" ? 7 : 1;

  // If today isn't logged yet, start checking from the most recent day that IS
  // logged, so an unbroken streak up to "yesterday" still counts.
  if (!completedDays.has(toDayString(cursor))) {
    cursor.setDate(cursor.getDate() - stepDays);
  }

  while (completedDays.has(toDayString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - stepDays);
  }

  return { habitId, streak, frequency: habit.frequency };
}

export async function listHabitsWithStreaks(userId: string) {
  const habits = await listHabits(userId);
  const withStreaks = await Promise.all(
    habits.map(async (h) => ({ ...h, ...(await getHabitStreak(userId, h.id)) }))
  );
  return withStreaks;
}

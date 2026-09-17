import { pool } from "../../lib/db";

export async function getDashboard(userId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [sleep, water, movement, spendToday, learningToday, upcomingTasks, habits] = await Promise.all([
    pool.query(
      `SELECT * FROM "SleepEntry" WHERE "userId" = $1 AND "deletedAt" IS NULL ORDER BY date DESC LIMIT 1`,
      [userId]
    ),
    pool.query(
      `SELECT COALESCE(SUM("amountMl"), 0) as total FROM "WaterEntry"
       WHERE "userId" = $1 AND "deletedAt" IS NULL AND "loggedAt" >= $2`,
      [userId, todayStart]
    ),
    pool.query(
      `SELECT COALESCE(SUM("durationMinutes"), 0) as total FROM "MovementEntry"
       WHERE "userId" = $1 AND "deletedAt" IS NULL AND "loggedAt" >= $2`,
      [userId, todayStart]
    ),
    pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM "Transaction"
       WHERE "userId" = $1 AND "deletedAt" IS NULL AND type = 'expense' AND date >= $2`,
      [userId, todayStart]
    ),
    pool.query(
      `SELECT COALESCE(SUM("durationMinutes"), 0) as total FROM "LearningSession"
       WHERE "userId" = $1 AND "deletedAt" IS NULL AND "loggedAt" >= $2`,
      [userId, todayStart]
    ),
    pool.query(
      `SELECT ct.*, c.name as "courseName" FROM "CourseTask" ct
       JOIN "Course" c ON c.id = ct."courseId"
       WHERE ct."userId" = $1 AND ct."deletedAt" IS NULL AND ct.status = 'pending' AND ct.deadline IS NOT NULL
       ORDER BY ct.deadline ASC LIMIT 3`,
      [userId]
    ),
    pool.query(`SELECT id, name, frequency FROM "Habit" WHERE "userId" = $1 AND "deletedAt" IS NULL AND active = true`, [userId]),
  ]);

  const settings = await pool.query('SELECT * FROM "UserSettings" WHERE "userId" = $1', [userId]);

  return {
    sleep: sleep.rows[0] || null,
    waterTodayMl: Number(water.rows[0].total),
    hydrationGoalMl: settings.rows[0]?.hydrationGoalMl ?? null,
    movementTodayMinutes: Number(movement.rows[0].total),
    spendTodayEtb: Number(spendToday.rows[0].total),
    learningTodayMinutes: Number(learningToday.rows[0].total),
    upcomingTasks: upcomingTasks.rows,
    habitCount: habits.rows.length,
  };
}

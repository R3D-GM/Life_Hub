import { randomUUID } from "crypto";
import { pool } from "../../lib/db";
import { insertEntity, listEntities, updateEntity, softDeleteEntity } from "../../lib/syncableEntity";
import { AppError } from "../../lib/AppError";

/**
 * "How many courses are you taking?" flow: creates the semester, then
 * immediately creates that many empty course slots (name defaults to
 * "Course 1", "Course 2", ... so the user can rename each one).
 */
export async function setupSemester(userId: string, input: { clientId: string; label: string; courseCount: number }) {
  const semester = await insertEntity("Semester", userId, input.clientId, { label: input.label });
  const courses = [];
  for (let i = 1; i <= input.courseCount; i++) {
    const course = await insertEntity("Course", userId, randomUUID(), {
      semesterId: semester.id,
      name: `Course ${i}`,
      code: null,
      creditHours: null,
    });
    courses.push(course);
  }
  return { semester, courses };
}

export const listSemesters = (userId: string) => listEntities("Semester", userId, { orderBy: "createdAt" });

export async function listCoursesForSemester(userId: string, semesterId: string) {
  const result = await pool.query(
    `SELECT * FROM "Course" WHERE "userId" = $1 AND "semesterId" = $2 AND "deletedAt" IS NULL ORDER BY "createdAt" ASC`,
    [userId, semesterId]
  );
  return result.rows;
}

export const updateCourse = (
  userId: string,
  clientId: string,
  fields: { name?: string; code?: string; creditHours?: number }
) => updateEntity("Course", userId, clientId, fields);

async function assertOwnsCourse(userId: string, courseId: string) {
  const result = await pool.query(
    'SELECT id FROM "Course" WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL',
    [courseId, userId]
  );
  if (!result.rows[0]) throw new AppError(404, "Course not found");
}

export const createTask = async (
  userId: string,
  input: { clientId: string; courseId: string; description: string; deadline?: string; status?: string }
) => {
  await assertOwnsCourse(userId, input.courseId);
  return insertEntity("CourseTask", userId, input.clientId, {
    courseId: input.courseId,
    description: input.description,
    deadline: input.deadline ?? null,
    status: input.status || "pending",
  });
};

export const updateTaskStatus = (userId: string, clientId: string, status: string) =>
  updateEntity("CourseTask", userId, clientId, { status });

export const deleteTask = (userId: string, clientId: string) => softDeleteEntity("CourseTask", userId, clientId);

export async function listUpcomingTasks(userId: string, limit = 5) {
  const result = await pool.query(
    `SELECT ct.*, c.name as "courseName" FROM "CourseTask" ct
     JOIN "Course" c ON c.id = ct."courseId"
     WHERE ct."userId" = $1 AND ct."deletedAt" IS NULL AND ct.status = 'pending'
       AND ct.deadline IS NOT NULL
     ORDER BY ct.deadline ASC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

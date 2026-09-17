import { pool } from "./db";
import { AppError } from "./AppError";

/**
 * Generic helpers for entities that follow the same shape:
 * id, userId, clientId, ...fields, deletedAt, createdAt, updatedAt.
 *
 * table/columns are always hard-coded by our own module code (never taken
 * from the request), so building SQL with them via template strings here is
 * safe — all *values* are still passed as parameterized $1, $2... args.
 */

export async function findByClientId(table: string, userId: string, clientId: string) {
  const result = await pool.query(
    `SELECT * FROM "${table}" WHERE "userId" = $1 AND "clientId" = $2`,
    [userId, clientId]
  );
  return result.rows[0] || null;
}

export async function insertEntity(
  table: string,
  userId: string,
  clientId: string,
  fields: Record<string, unknown>
) {
  const existing = await findByClientId(table, userId, clientId);
  if (existing) {
    // idempotent: retried creates (e.g. after a flaky sync) return the existing row
    return existing;
  }
  const columns = ["userId", "clientId", ...Object.keys(fields)];
  const values = [userId, clientId, ...Object.values(fields)];
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  const quotedColumns = columns.map((c) => `"${c}"`).join(", ");
  const result = await pool.query(
    `INSERT INTO "${table}" (${quotedColumns}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function updateEntity(
  table: string,
  userId: string,
  clientId: string,
  fields: Record<string, unknown>
) {
  const existing = await findByClientId(table, userId, clientId);
  if (!existing) {
    throw new AppError(404, `${table} record not found`);
  }
  const setClauses = Object.keys(fields).map((k, i) => `"${k}" = $${i + 3}`);
  const values = [userId, clientId, ...Object.values(fields)];
  const result = await pool.query(
    `UPDATE "${table}" SET ${setClauses.join(", ")}, "updatedAt" = now()
     WHERE "userId" = $1 AND "clientId" = $2 RETURNING *`,
    values
  );
  return result.rows[0];
}

export async function softDeleteEntity(table: string, userId: string, clientId: string) {
  const result = await pool.query(
    `UPDATE "${table}" SET "deletedAt" = now(), "updatedAt" = now()
     WHERE "userId" = $1 AND "clientId" = $2 RETURNING *`,
    [userId, clientId]
  );
  if (!result.rows[0]) {
    throw new AppError(404, `${table} record not found`);
  }
  return result.rows[0];
}

export async function listEntities(
  table: string,
  userId: string,
  opts: { orderBy?: string; limit?: number } = {}
) {
  const orderBy = opts.orderBy || "createdAt";
  const limit = opts.limit || 500;
  const result = await pool.query(
    `SELECT * FROM "${table}" WHERE "userId" = $1 AND "deletedAt" IS NULL
     ORDER BY "${orderBy}" DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

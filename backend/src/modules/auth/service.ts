import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../lib/db";
import { AppError } from "../../lib/AppError";

export async function registerUser(email: string, password: string, name?: string) {
  const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw new AppError(409, "An account with this email already exists");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO "User" (email, "passwordHash", name) VALUES ($1, $2, $3)
     RETURNING id, email, name, "createdAt"`,
    [email, passwordHash, name || null]
  );
  const user = result.rows[0];
  await pool.query('INSERT INTO "UserSettings" ("userId") VALUES ($1)', [user.id]);
  return user;
}

export async function loginUser(email: string, password: string) {
  const result = await pool.query(
    'SELECT id, email, name, "passwordHash" FROM "User" WHERE email = $1',
    [email]
  );
  const user = result.rows[0];
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }
  return { id: user.id, email: user.email, name: user.name };
}

export function signToken(userId: string) {
  const secret = process.env.JWT_SECRET as string;
  return jwt.sign({ userId }, secret, { expiresIn: "30d" });
}

export async function getUserById(userId: string) {
  const result = await pool.query(
    'SELECT id, email, name, "createdAt" FROM "User" WHERE id = $1',
    [userId]
  );
  if (!result.rows[0]) {
    throw new AppError(404, "User not found");
  }
  return result.rows[0];
}

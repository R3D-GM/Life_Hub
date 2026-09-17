import { pool } from "../../lib/db";
import { insertEntity, listEntities, softDeleteEntity } from "../../lib/syncableEntity";
import { AppError } from "../../lib/AppError";

export const createAccount = (userId: string, input: { clientId: string; name: string; type: string }) =>
  insertEntity("Account", userId, input.clientId, { name: input.name, type: input.type });

export const listAccounts = (userId: string) => listEntities("Account", userId, { orderBy: "createdAt" });
export const deleteAccount = (userId: string, clientId: string) => softDeleteEntity("Account", userId, clientId);

export const createCategory = (userId: string, input: { clientId: string; name: string }) =>
  insertEntity("TransactionCategory", userId, input.clientId, { name: input.name });
export const listCategories = (userId: string) =>
  listEntities("TransactionCategory", userId, { orderBy: "name" });

async function assertOwnsAccount(userId: string, accountId: string) {
  const result = await pool.query(
    'SELECT id FROM "Account" WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL',
    [accountId, userId]
  );
  if (!result.rows[0]) {
    throw new AppError(404, "Account not found");
  }
}

export async function createTransaction(
  userId: string,
  input: {
    clientId: string;
    accountId: string;
    categoryId?: string;
    type: string;
    amount: number;
    currency?: string;
    note?: string;
    date: string;
    transferToAccountId?: string;
  }
) {
  await assertOwnsAccount(userId, input.accountId);
  if (input.type === "transfer") {
    if (!input.transferToAccountId) {
      throw new AppError(400, "transferToAccountId is required for transfers");
    }
    await assertOwnsAccount(userId, input.transferToAccountId);
  }
  return insertEntity("Transaction", userId, input.clientId, {
    accountId: input.accountId,
    categoryId: input.categoryId ?? null,
    type: input.type,
    amount: input.amount,
    currency: input.currency || "ETB",
    note: input.note ?? null,
    date: input.date,
    transferToAccountId: input.transferToAccountId ?? null,
  });
}

export const listTransactions = (userId: string) =>
  listEntities("Transaction", userId, { orderBy: "date" });

export const deleteTransaction = (userId: string, clientId: string) =>
  softDeleteEntity("Transaction", userId, clientId);

/**
 * Balance per account = sum(income) - sum(expense) + sum(transfers in) - sum(transfers out).
 * Computed on read, never stored, so it can never drift from the transaction log.
 */
export async function getAccountBalances(userId: string) {
  const accounts = await listEntities("Account", userId, { orderBy: "createdAt", limit: 1000 });
  const balances: Record<string, number> = {};
  for (const acc of accounts) balances[acc.id] = 0;

  const result = await pool.query(
    `SELECT "accountId", "transferToAccountId", type, amount FROM "Transaction"
     WHERE "userId" = $1 AND "deletedAt" IS NULL`,
    [userId]
  );

  for (const tx of result.rows) {
    const amount = Number(tx.amount);
    if (tx.type === "income") {
      balances[tx.accountId] = (balances[tx.accountId] || 0) + amount;
    } else if (tx.type === "expense") {
      balances[tx.accountId] = (balances[tx.accountId] || 0) - amount;
    } else if (tx.type === "transfer") {
      balances[tx.accountId] = (balances[tx.accountId] || 0) - amount;
      balances[tx.transferToAccountId] = (balances[tx.transferToAccountId] || 0) + amount;
    }
  }

  return accounts.map((acc) => ({ ...acc, balance: balances[acc.id] || 0 }));
}

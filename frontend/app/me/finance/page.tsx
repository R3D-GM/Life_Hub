"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Account { id: string; name: string; type: string; balance: number; }

export default function FinancePage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accName, setAccName] = useState("");
  const [accType, setAccType] = useState("cash");

  const [txType, setTxType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [transferToAccountId, setTransferToAccountId] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    const data = await api.get<{ accounts: Account[] }>("/api/finance/accounts");
    setAccounts(data.accounts);
    if (data.accounts[0] && !accountId) setAccountId(data.accounts[0].id);
  }
  useEffect(() => { load(); }, []);

  async function createAccount() {
    if (!accName) return;
    await api.post("/api/finance/accounts", { clientId: crypto.randomUUID(), name: accName, type: accType });
    setAccName("");
    load();
  }

  async function createTransaction() {
    if (!amount || !accountId) return;
    await api.post("/api/finance/transactions", {
      clientId: crypto.randomUUID(),
      accountId,
      type: txType,
      amount: Number(amount),
      date: new Date().toISOString(),
      note: note || undefined,
      transferToAccountId: txType === "transfer" ? transferToAccountId : undefined,
    });
    setAmount("");
    setNote("");
    load();
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Finance</h1>

      <div className="mb-4 flex flex-col gap-3">
        {accounts.map((a) => (
          <div key={a.id} className="card flex justify-between">
            <span className="capitalize">{a.name} <span className="text-xs text-[var(--muted)]">({a.type})</span></span>
            <span className="font-medium">ETB {a.balance.toLocaleString()}</span>
          </div>
        ))}
        {accounts.length === 0 && <p className="text-sm text-[var(--muted)]">Create an account to start logging.</p>}
      </div>

      <div className="card mb-4">
        <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">New account</p>
        <div className="flex gap-2">
          <input value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Name (e.g. Bank)"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          <select value={accType} onChange={(e) => setAccType(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-2 py-2 text-sm">
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="mobileMoney">Mobile money</option>
            <option value="other">Other</option>
          </select>
          <button onClick={createAccount} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white">Add</button>
        </div>
      </div>

      <div className="card">
        <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">New transaction</p>
        <div className="mb-2 flex gap-2">
          {["expense", "income", "transfer"].map((t) => (
            <button key={t} onClick={() => setTxType(t)}
              className={`flex-1 rounded-xl py-2 text-xs capitalize ${txType === t ? "bg-[var(--accent)] text-white" : "bg-[var(--surface-muted)]"}`}>
              {t}
            </button>
          ))}
        </div>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
          className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        {txType === "transfer" && (
          <select value={transferToAccountId} onChange={(e) => setTransferToAccountId(e.target.value)}
            className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
            <option value="">To account...</option>
            {accounts.filter((a) => a.id !== accountId).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        )}
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (ETB)"
          className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)"
          className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        <button onClick={createTransaction} className="w-full rounded-xl bg-[var(--accent)] py-2 text-sm text-white">Save</button>
      </div>
    </main>
  );
}

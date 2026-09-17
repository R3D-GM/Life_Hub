"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Habit { id: string; name: string; frequency: string; streak: number; }

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const data = await api.get<{ habits: Habit[] }>("/api/habits");
    setHabits(data.habits);
  }
  useEffect(() => { load(); }, []);

  async function createHabit() {
    if (!name) return;
    await api.post("/api/habits", { clientId: crypto.randomUUID(), name, frequency: "daily" });
    setName("");
    load();
  }

  async function completeToday(habitId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await api.post("/api/habits/complete", {
      clientId: crypto.randomUUID(),
      habitId,
      date: today.toISOString(),
    });
    load();
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Habits</h1>

      <div className="card mb-4 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New habit (e.g. Study)"
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        <button onClick={createHabit} className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm text-white">Add</button>
      </div>

      {habits.length === 0 && <p className="text-sm text-[var(--muted)]">No habits yet — add one above to start a streak.</p>}

      <div className="flex flex-col gap-3">
        {habits.map((h) => (
          <div key={h.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">{h.name}</p>
              <p className="text-xs text-[var(--muted)]">🔥 {h.streak} day streak</p>
            </div>
            <button onClick={() => completeToday(h.id)} className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium">
              Mark done today
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

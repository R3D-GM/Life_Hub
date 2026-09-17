"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Milestone { id: string; name: string; completed: boolean; }
interface Goal { id: string; category: string; name: string; progressPercent: number; milestones: Milestone[]; }

const CATEGORY_LABELS: Record<string, string> = {
  career: "Career", aiml: "AI/ML", university: "University", spiritual: "Spiritual", personal: "Personal",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("personal");

  async function load() {
    const data = await api.get<{ goals: Goal[] }>("/api/goals");
    setGoals(data.goals);
  }

  useEffect(() => { load(); }, []);

  async function createGoal() {
    if (!name) return;
    await api.post("/api/goals", { clientId: crypto.randomUUID(), name, category, progressPercent: 0 });
    setName("");
    setShowForm(false);
    load();
  }

  async function toggleMilestone(m: Milestone) {
    await api.patch(`/api/goals/milestones/${m.id}`, { completed: !m.completed });
    load();
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Goals</h1>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-[var(--accent)]">
          {showForm ? "Cancel" : "+ New goal"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4 flex flex-col gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Goal name"
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm">
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={createGoal} className="rounded-xl bg-[var(--accent)] py-2 text-sm text-white">Create</button>
        </div>
      )}

      {goals.length === 0 && !showForm && (
        <p className="text-sm text-[var(--muted)]">Start with one thing you want to improve.</p>
      )}

      <div className="flex flex-col gap-3">
        {goals.map((g) => (
          <div key={g.id} className="card">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-medium">{g.name}</p>
              <span className="text-xs text-[var(--muted)]">{CATEGORY_LABELS[g.category]}</span>
            </div>
            <div className="mb-2 h-2 rounded-full bg-[var(--surface-muted)]">
              <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${g.progressPercent}%` }} />
            </div>
            {g.milestones.map((m) => (
              <label key={m.id} className="flex items-center gap-2 py-0.5 text-sm">
                <input type="checkbox" checked={m.completed} onChange={() => toggleMilestone(m)} />
                <span className={m.completed ? "line-through text-[var(--muted)]" : ""}>{m.name}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}

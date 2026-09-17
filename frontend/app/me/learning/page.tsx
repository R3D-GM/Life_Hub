"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Skill { id: string; name: string; progressPercent: number; }
interface Session { id: string; topic: string; durationMinutes: number; loggedAt: string; }

export default function LearningPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [skillName, setSkillName] = useState("");
  const [progress, setProgress] = useState(0);

  async function load() {
    const s = await api.get<{ skills: Skill[] }>("/api/learning/skills");
    setSkills(s.skills);
    const sess = await api.get<{ sessions: Session[] }>("/api/learning/sessions");
    setSessions(sess.sessions.slice(0, 10));
  }
  useEffect(() => { load(); }, []);

  async function addSkill() {
    if (!skillName) return;
    await api.post("/api/learning/skills", { clientId: crypto.randomUUID(), name: skillName, progressPercent: progress });
    setSkillName("");
    setProgress(0);
    load();
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Learning & Skills</h1>

      <div className="flex flex-col gap-3">
        {skills.map((s) => (
          <div key={s.id} className="card">
            <div className="mb-1 flex justify-between text-sm">
              <span>{s.name}</span>
              <span>{s.progressPercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--surface-muted)]">
              <div className="h-2 rounded-full bg-[var(--accent)]" style={{ width: `${s.progressPercent}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="card my-4">
        <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">New skill</p>
        <input value={skillName} onChange={(e) => setSkillName(e.target.value)} placeholder="e.g. Machine Learning"
          className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        <input type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))}
          placeholder="Progress %" className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm" />
        <button onClick={addSkill} className="w-full rounded-xl bg-[var(--accent)] py-2 text-sm text-white">Add</button>
      </div>

      <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">Recent sessions</p>
      <div className="flex flex-col gap-2">
        {sessions.map((s) => (
          <div key={s.id} className="card flex justify-between text-sm">
            <span>{s.topic}</span>
            <span className="text-[var(--muted)]">{s.durationMinutes}m</span>
          </div>
        ))}
        {sessions.length === 0 && <p className="text-sm text-[var(--muted)]">No sessions logged yet.</p>}
      </div>
    </main>
  );
}

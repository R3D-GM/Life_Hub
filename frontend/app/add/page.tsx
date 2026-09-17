"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logLocally } from "@/lib/db";
import { runSync } from "@/lib/sync";

type Kind = "water" | "sleep" | "movement" | "nutrition" | "learningSession" | null;

export default function AddPage() {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>(null);
  const [saved, setSaved] = useState(false);

  async function save(entityType: string, payload: Record<string, unknown>) {
    await logLocally(entityType, payload);
    runSync(); // fire-and-forget; works even if this fails (offline) - stays queued
    setSaved(true);
    setTimeout(() => router.push("/home"), 700);
  }

  if (saved) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Saved ✓</p>
      </main>
    );
  }

  if (kind === "water") return <WaterForm onSave={(ml) => save("water", { amountMl: ml, loggedAt: new Date().toISOString() })} />;
  if (kind === "sleep") return <SleepForm onSave={(bedtime, wakeTime) => save("sleep", { bedtime, wakeTime, date: new Date().toISOString() })} />;
  if (kind === "movement") return <MovementForm onSave={(activityType, durationMinutes) => save("movement", { activityType, durationMinutes, loggedAt: new Date().toISOString() })} />;
  if (kind === "nutrition") return <NutritionForm onSave={(mealType, description) => save("nutrition", { mealType, description, loggedAt: new Date().toISOString() })} />;
  if (kind === "learningSession") return <LearningForm onSave={(topic, durationMinutes) => save("learningSession", { topic, durationMinutes, loggedAt: new Date().toISOString() })} />;

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Quick Add</h1>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: "water", label: "💧 Water" },
          { key: "sleep", label: "😴 Sleep" },
          { key: "movement", label: "🏃 Movement" },
          { key: "nutrition", label: "🍽️ Meal" },
          { key: "learningSession", label: "📚 Learning" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setKind(item.key as Kind)}
            className="card text-left text-sm font-medium active:scale-95 transition-transform"
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-6 text-xs text-[var(--muted)]">
        Finance, habits, and goals have their own quick-add on their pages under Me — this sheet covers the fastest daily logs.
      </p>
    </main>
  );
}

function WaterForm({ onSave }: { onSave: (ml: number) => void }) {
  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Log water</h1>
      <div className="grid grid-cols-2 gap-3">
        {[250, 500, 750, 1000].map((ml) => (
          <button key={ml} onClick={() => onSave(ml)} className="card text-lg font-medium active:scale-95">
            {ml}ml
          </button>
        ))}
      </div>
    </main>
  );
}

function SleepForm({ onSave }: { onSave: (bedtime: string, wakeTime: string) => void }) {
  const [bedtime, setBedtime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Log sleep</h1>
      <label className="mb-1 block text-xs text-[var(--muted)]">Bedtime</label>
      <input type="datetime-local" value={bedtime} onChange={(e) => setBedtime(e.target.value)}
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm" />
      <label className="mb-1 block text-xs text-[var(--muted)]">Wake time</label>
      <input type="datetime-local" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)}
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm" />
      <button
        disabled={!bedtime || !wakeTime}
        onClick={() => onSave(new Date(bedtime).toISOString(), new Date(wakeTime).toISOString())}
        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        Save
      </button>
    </main>
  );
}

function MovementForm({ onSave }: { onSave: (activityType: string, durationMinutes: number) => void }) {
  const [activityType, setActivityType] = useState("walking");
  const [minutes, setMinutes] = useState(30);
  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Log movement</h1>
      <div className="mb-4 flex gap-2">
        {["walking", "running", "jump_rope"].map((a) => (
          <button key={a} onClick={() => setActivityType(a)}
            className={`flex-1 rounded-xl py-2 text-sm capitalize ${activityType === a ? "bg-[var(--accent)] text-white" : "card"}`}>
            {a.replace("_", " ")}
          </button>
        ))}
      </div>
      <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm" placeholder="Minutes" />
      <button onClick={() => onSave(activityType, minutes)} className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-white">
        Save
      </button>
    </main>
  );
}

function NutritionForm({ onSave }: { onSave: (mealType: string, description: string) => void }) {
  const [mealType, setMealType] = useState("breakfast");
  const [description, setDescription] = useState("");
  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Log a meal</h1>
      <select value={mealType} onChange={(e) => setMealType(e.target.value)}
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
        {["breakfast", "lunch", "dinner", "snack"].map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What did you eat?"
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm" rows={3} />
      <button disabled={!description} onClick={() => onSave(mealType, description)}
        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-white disabled:opacity-50">
        Save
      </button>
    </main>
  );
}

function LearningForm({ onSave }: { onSave: (topic: string, durationMinutes: number) => void }) {
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(30);
  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">Log a learning session</h1>
      <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (e.g. Machine Learning)"
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm" />
      <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} placeholder="Minutes"
        className="mb-4 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm" />
      <button disabled={!topic} onClick={() => onSave(topic, minutes)}
        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-medium text-white disabled:opacity-50">
        Save
      </button>
    </main>
  );
}

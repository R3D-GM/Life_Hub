"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface SleepEntry { id: string; durationMinutes: number; date: string; quality: number | null; }
interface WaterEntry { id: string; amountMl: number; loggedAt: string; }
interface MovementEntry { id: string; activityType: string; durationMinutes: number; loggedAt: string; }
interface NutritionEntry { id: string; mealType: string; description: string; loggedAt: string; }

export default function HealthPage() {
  const [sleep, setSleep] = useState<SleepEntry[]>([]);
  const [water, setWater] = useState<WaterEntry[]>([]);
  const [movement, setMovement] = useState<MovementEntry[]>([]);
  const [nutrition, setNutrition] = useState<NutritionEntry[]>([]);

  useEffect(() => {
    api.get<{ entries: SleepEntry[] }>("/api/health/sleep").then((d) => setSleep(d.entries.slice(0, 7)));
    api.get<{ entries: WaterEntry[] }>("/api/health/water").then((d) => setWater(d.entries.slice(0, 7)));
    api.get<{ entries: MovementEntry[] }>("/api/health/movement").then((d) => setMovement(d.entries.slice(0, 7)));
    api.get<{ entries: NutritionEntry[] }>("/api/health/nutrition").then((d) => setNutrition(d.entries.slice(0, 7)));
  }, []);

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Health</h1>
        <Link href="/add" className="text-sm text-[var(--accent)]">+ Log</Link>
      </div>

      <Section title="Sleep" empty="Log your first night to start seeing your sleep pattern.">
        {sleep.map((s) => (
          <Row key={s.id} left={new Date(s.date).toLocaleDateString()} right={`${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m`} />
        ))}
      </Section>

      <Section title="Water" empty="Your hydration will appear here.">
        {water.map((w) => (
          <Row key={w.id} left={new Date(w.loggedAt).toLocaleString()} right={`${w.amountMl}ml`} />
        ))}
      </Section>

      <Section title="Movement" empty="Log a walk, run, or jump rope session to get started.">
        {movement.map((m) => (
          <Row key={m.id} left={m.activityType.replace("_", " ")} right={`${m.durationMinutes}m`} />
        ))}
      </Section>

      <Section title="Meals" empty="Your meals will appear here.">
        {nutrition.map((n) => (
          <Row key={n.id} left={`${n.mealType}: ${n.description}`} right="" />
        ))}
      </Section>
    </main>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">{title}</p>
      {hasChildren ? <div className="flex flex-col gap-2">{children}</div> : <p className="card text-sm text-[var(--muted)]">{empty}</p>}
    </div>
  );
}

function Row({ left, right }: { left: string; right: string }) {
  return (
    <div className="card flex justify-between text-sm capitalize">
      <span>{left}</span>
      <span className="text-[var(--muted)]">{right}</span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Entry { loggedAt?: string; date?: string; amountMl?: number; durationMinutes?: number; }

export default function InsightsPage() {
  const [water, setWater] = useState<Entry[]>([]);
  const [movement, setMovement] = useState<Entry[]>([]);
  const [sleep, setSleep] = useState<Entry[]>([]);

  useEffect(() => {
    api.get<{ entries: Entry[] }>("/api/health/water").then((d) => setWater(d.entries));
    api.get<{ entries: Entry[] }>("/api/health/movement").then((d) => setMovement(d.entries));
    api.get<{ entries: Entry[] }>("/api/health/sleep").then((d) => setSleep(d.entries));
  }, []);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const inLastWeek = (d?: string) => d && new Date(d).getTime() >= weekAgo;

  const waterTotal = water.filter((w) => inLastWeek(w.loggedAt)).reduce((s, w) => s + (w.amountMl || 0), 0);
  const movementTotal = movement.filter((m) => inLastWeek(m.loggedAt)).reduce((s, m) => s + (m.durationMinutes || 0), 0);
  const sleepEntries = sleep.filter((s) => inLastWeek(s.date));
  const avgSleep = sleepEntries.length
    ? Math.round(sleepEntries.reduce((s, e) => s + (e.durationMinutes || 0), 0) / sleepEntries.length)
    : 0;

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-6 text-xl font-semibold">This week</h1>
      <div className="flex flex-col gap-3">
        <div className="card flex justify-between">
          <span className="text-sm text-[var(--muted)]">Average sleep</span>
          <span className="font-medium">{avgSleep ? `${Math.floor(avgSleep / 60)}h ${avgSleep % 60}m` : "No data yet"}</span>
        </div>
        <div className="card flex justify-between">
          <span className="text-sm text-[var(--muted)]">Total water</span>
          <span className="font-medium">{waterTotal}ml</span>
        </div>
        <div className="card flex justify-between">
          <span className="text-sm text-[var(--muted)]">Total movement</span>
          <span className="font-medium">{movementTotal} min</span>
        </div>
      </div>
      <p className="mt-6 text-xs text-[var(--muted)]">
        Cross-domain AI insights arrive in a later phase — this view is the simple weekly rollup for MVP.
      </p>
    </main>
  );
}

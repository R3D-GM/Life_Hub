"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface DashboardData {
  sleep: { durationMinutes: number } | null;
  waterTodayMl: number;
  hydrationGoalMl: number | null;
  movementTodayMinutes: number;
  spendTodayEtb: number;
  learningTodayMinutes: number;
  upcomingTasks: { id: string; description: string; courseName: string; deadline: string }[];
  habitCount: number;
}

function fmtMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get<DashboardData>("/api/dashboard").then(setData).catch(() => {});
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="text-2xl font-semibold">Good day, {firstName} 👋</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">{today}</p>

      {!data ? (
        <div className="card animate-pulse text-sm text-[var(--muted)]">Loading today's snapshot...</div>
      ) : (
        <>
          <section className="card mb-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-[var(--muted)]">Sleep</p>
              <p className="text-lg font-medium">{data.sleep ? fmtMinutes(data.sleep.durationMinutes) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Water</p>
              <p className="text-lg font-medium">
                {data.waterTodayMl}ml{data.hydrationGoalMl ? ` / ${data.hydrationGoalMl}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Movement</p>
              <p className="text-lg font-medium">{fmtMinutes(data.movementTodayMinutes)}</p>
            </div>
          </section>

          {data.upcomingTasks.length > 0 && (
            <section className="card mb-4">
              <p className="mb-2 text-xs font-medium uppercase text-[var(--muted)]">Upcoming</p>
              {data.upcomingTasks.map((t) => (
                <div key={t.id} className="flex justify-between py-1 text-sm">
                  <span>{t.description} <span className="text-[var(--muted)]">— {t.courseName}</span></span>
                  <span className="text-[var(--muted)]">{new Date(t.deadline).toLocaleDateString()}</span>
                </div>
              ))}
            </section>
          )}

          <section className="card mb-4 flex justify-between">
            <div>
              <p className="text-xs text-[var(--muted)]">Spent today</p>
              <p className="text-lg font-medium">ETB {data.spendTodayEtb}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--muted)]">Learning today</p>
              <p className="text-lg font-medium">{fmtMinutes(data.learningTodayMinutes)}</p>
            </div>
          </section>

          <section className="card">
            <p className="text-sm">🔥 {data.habitCount} active habit{data.habitCount === 1 ? "" : "s"}</p>
          </section>
        </>
      )}
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const SECTIONS = [
  { href: "/me/health", label: "Health", icon: "❤️", desc: "Sleep, water, movement, meals" },
  { href: "/me/finance", label: "Finance", icon: "💰", desc: "Accounts & transactions" },
  { href: "/me/learning", label: "Learning & Skills", icon: "📚", desc: "Skills and sessions" },
  { href: "/me/university", label: "University", icon: "🎓", desc: "Semesters, courses, tasks" },
  { href: "/me/habits", label: "Habits", icon: "🔥", desc: "Streaks & consistency" },
];

export default function MePage() {
  const { user, refresh } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await api.post("/api/auth/logout");
    await refresh();
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-md px-4 pt-8">
      <h1 className="mb-1 text-xl font-semibold">{user?.name || user?.email}</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">{user?.email}</p>

      <div className="flex flex-col gap-3">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card flex items-center gap-3">
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-[var(--muted)]">{s.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="card mt-4 flex items-center justify-between">
        <span className="text-sm">Theme</span>
        <button
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs"
        >
          {theme === "light" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <button
        onClick={logout}
        disabled={loggingOut}
        className="mt-6 w-full rounded-xl border border-[var(--border)] py-3 text-sm text-[var(--muted)]"
      >
        Log out
      </button>
    </main>
  );
}

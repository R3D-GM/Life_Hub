"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/home", label: "Home", icon: "🏠" },
  { href: "/insights", label: "Insights", icon: "📊" },
  { href: "/add", label: "Add", icon: "➕", isAdd: true },
  { href: "/goals", label: "Goals", icon: "🎯" },
  { href: "/me", label: "Me", icon: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-1.5">
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          if (tab.isAdd) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex -translate-y-3 h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-2xl text-white shadow-lg shadow-black/10 active:scale-95 transition-transform"
                aria-label="Quick add"
              >
                {tab.icon}
              </Link>
            );
          }
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs transition-colors ${
                active ? "text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

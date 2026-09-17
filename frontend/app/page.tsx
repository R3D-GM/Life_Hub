"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/home" : "/login");
  }, [user, loading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-[var(--muted)]">Loading LifeHub...</p>
    </main>
  );
}

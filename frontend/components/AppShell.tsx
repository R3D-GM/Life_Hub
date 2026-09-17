"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import { startSyncEngine } from "@/lib/sync";
import { registerServiceWorker } from "@/lib/registerSW";
import { AuthContext, useAuthState } from "@/lib/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const authState = useAuthState();

  useEffect(() => {
    startSyncEngine();
    registerServiceWorker();
  }, []);

  return (
    <AuthContext.Provider value={authState}>
      <div className={isAuthPage ? "" : "pb-24"}>{children}</div>
      {!isAuthPage && <BottomNav />}
    </AuthContext.Provider>
  );
}

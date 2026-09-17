"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = (localStorage.getItem("lifehub_theme") as "light" | "dark" | null) || "light";
    setThemeState(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  function setTheme(next: "light" | "dark") {
    setThemeState(next);
    localStorage.setItem("lifehub_theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return { theme, setTheme };
}

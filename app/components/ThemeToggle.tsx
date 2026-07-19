"use client";

import { useEffect, useState } from "react";

/**
 * Light/dark theme switch. Dark is the default (no data-theme attribute);
 * light mode sets data-theme="light" on <html> and persists to localStorage,
 * mirroring the anti-FOUC script in app/layout.tsx.
 */
export default function ThemeToggle({ className = "", showLabel = false }: { className?: string; showLabel?: boolean }) {
  // null until mounted so the server render (which can't know the theme)
  // matches the first client render — the icon only appears after mount.
  const [theme, setTheme] = useState<"dark" | "light" | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the DOM (set pre-paint by the layout's inline script)
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    if (next === "light") {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage unavailable (private mode etc.) — theme still applies for this page.
    }
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      className={`inline-flex items-center gap-3 transition-colors ${className || "text-muted-2 hover:text-foreground"}`}
    >
      {/* fixed 16px box reserves space before mount so there's no layout shift */}
      <span className="w-4 h-4 flex items-center justify-center shrink-0">
        {theme === "dark" && (
          // Sun: shown in dark mode, meaning "switch to light"
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        )}
        {theme === "light" && (
          // Moon: shown in light mode, meaning "switch to dark"
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </span>
      {showLabel && (
        <span style={{ fontFamily: "var(--font-inter)" }}>
          {theme === "dark" ? "Light mode" : theme === "light" ? "Dark mode" : ""}
        </span>
      )}
    </button>
  );
}

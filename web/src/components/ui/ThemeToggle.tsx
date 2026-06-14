"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/cn";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hidrasyon guard'ı: tema yalnızca client'ta bilinir (SSR uyuşmazlığını önler).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const options = [
    { value: "light", icon: <Sun className="h-3.5 w-3.5" />, label: "Açık" },
    { value: "system", icon: <Monitor className="h-3.5 w-3.5" />, label: "Sistem" },
    { value: "dark", icon: <Moon className="h-3.5 w-3.5" />, label: "Koyu" },
  ] as const;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md p-1",
        "bg-[var(--color-surface-raised)] border border-[var(--color-border-subtle)]",
        className,
      )}
      role="group"
      aria-label="Tema seçici"
    >
      {options.map(({ value, icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          aria-label={label}
          aria-pressed={theme === value}
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-sm",
            "transition-all duration-[var(--duration-fast)]",
            theme === value
              ? "bg-[var(--color-brand-600)] text-white shadow-sm"
              : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-glass)]",
          )}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

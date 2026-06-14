"use client";

import { cn } from "@/lib/cn";

const MOOD_META: Record<string, { label: string; color: string }> = {
  HAPPY:   { label: "Mutlu",    color: "#FFD700" },
  NEUTRAL: { label: "Nötr",     color: "#95A5A6" },
  SAD:     { label: "Üzgün",    color: "#5B9BD5" },
  ANXIOUS: { label: "Endişeli", color: "#9B59B6" },
};

interface MoodChipProps {
  mood: string;
  className?: string;
  size?: "sm" | "md";
}

export default function MoodChip({ mood, className, size = "md" }: MoodChipProps) {
  const meta = MOOD_META[mood] ?? { label: mood, color: "#95A5A6" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        "border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)]",
        "text-[var(--color-text-secondary)]",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: meta.color }}
      />
      {meta.label}
    </span>
  );
}

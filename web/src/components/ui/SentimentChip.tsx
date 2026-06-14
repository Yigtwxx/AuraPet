"use client";

import { cn } from "@/lib/cn";

const SENTIMENT_META: Record<string, { label: string; color: string }> = {
  POSITIVE: { label: "Pozitif", color: "#22c55e" },
  NEGATIVE: { label: "Negatif", color: "#ef4444" },
  NEUTRAL:  { label: "Nötr",    color: "#95A5A6" },
};

interface SentimentChipProps {
  label: string;
  className?: string;
  size?: "sm" | "md";
}

export default function SentimentChip({
  label,
  className,
  size = "md",
}: SentimentChipProps) {
  const meta = SENTIMENT_META[label] ?? { label, color: "#95A5A6" };

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

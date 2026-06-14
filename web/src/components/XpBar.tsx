"use client";

import { motion } from "framer-motion";

const XP_THRESHOLDS = [0, 100, 250, 500, 900];

function xpProgress(xp: number, level: number): number {
  const current = XP_THRESHOLDS[level - 1] ?? 0;
  const next = XP_THRESHOLDS[level] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
  if (next <= current) return 100;
  return Math.min(((xp - current) / (next - current)) * 100, 100);
}

interface XpBarProps {
  xp: number;
  level: number;
  color: string;
}

export default function XpBar({ xp, level, color }: XpBarProps) {
  const progress = xpProgress(xp, level);
  const isMaxLevel = level >= 5;
  const nextThreshold = XP_THRESHOLDS[level] ?? xp;

  return (
    <div className="mt-4">
      <div className="flex justify-between text-[11px] mb-2">
        <span style={{ color: "var(--color-text-tertiary)" }}>
          XP{" "}
          <span
            className="font-semibold tabular-nums"
            style={{ color: "var(--color-text-primary)" }}
          >
            {xp}
          </span>
        </span>
        <span style={{ color: "var(--color-text-tertiary)" }}>
          {isMaxLevel ? (
            <span className="font-semibold" style={{ color }}>
              Maks Seviye!
            </span>
          ) : (
            <>
              Sonraki{" "}
              <span
                className="font-semibold tabular-nums"
                style={{ color: "var(--color-text-primary)" }}
              >
                {nextThreshold}
              </span>
            </>
          )}
        </span>
      </div>

      {/* Track */}
      <div
        className="h-2 rounded-full overflow-hidden relative"
        style={{ background: "var(--color-surface-glass-strong)" }}
      >
        {/* Fill */}
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Shimmer */}
          {!isMaxLevel && (
            <span
              className="absolute inset-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.30), transparent)",
                animation: "shimmer 2.4s ease-in-out infinite",
              }}
            />
          )}
        </motion.div>

        {/* Max level pulse ring */}
        {isMaxLevel && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: `inset 0 0 0 1px ${color}` }}
          />
        )}
      </div>
    </div>
  );
}

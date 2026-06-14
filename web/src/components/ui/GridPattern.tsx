"use client";

import { cn } from "@/lib/cn";

interface GridPatternProps {
  className?: string;
  /** Cell size in px */
  size?: number;
  /** Line opacity (0–1) */
  opacity?: number;
  /** Optional radial mask — fades edges to transparent */
  fadeEdges?: boolean;
  /** Optional spotlight position — bright at this point, dark elsewhere */
  spotlight?: { x: string; y: string };
}

/**
 * Subtle background grid. Place inside a `relative` container.
 * Defaults to softly fading at the edges so it never feels boxy.
 */
export default function GridPattern({
  className,
  size = 40,
  opacity = 0.045,
  fadeEdges = true,
  spotlight,
}: GridPatternProps) {
  const mask = spotlight
    ? `radial-gradient(circle at ${spotlight.x} ${spotlight.y}, black, transparent 65%)`
    : fadeEdges
      ? "radial-gradient(ellipse at center, black 30%, transparent 75%)"
      : undefined;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `
          linear-gradient(rgba(237,242,240,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(237,242,240,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        WebkitMaskImage: mask,
        maskImage: mask,
      }}
    />
  );
}

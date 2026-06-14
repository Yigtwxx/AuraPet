"use client";

import { cn } from "@/lib/cn";

interface NoiseOverlayProps {
  className?: string;
  opacity?: number;
}

/**
 * Adds a fine film-grain noise texture to take the digital sheen off flat
 * gradients. Place inside a `relative` container with `overflow-hidden`.
 */
export default function NoiseOverlay({
  className,
  opacity = 0.04,
}: NoiseOverlayProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 mix-blend-overlay",
        className,
      )}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.65'/></svg>\")",
      }}
    />
  );
}

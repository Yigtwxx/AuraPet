"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  /** Radial gradient color, defaults to brand teal */
  color?: string;
  /** Radius of the spotlight in px */
  size?: number;
  /** Show a subtle gradient border that lights up on hover */
  borderGlow?: boolean;
  as?: "div" | "section" | "article";
}

/**
 * Mouse-tracked spotlight wrapper. Use as a card container — the radial
 * highlight follows the cursor for a premium, cinematic feel.
 */
export default function Spotlight({
  children,
  className,
  color = "rgba(38,166,160,0.18)",
  size = 380,
  borderGlow = true,
  as: Tag = "div",
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [opacity, setOpacity] = useState(0);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      onMouseMove={handleMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Spotlight glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(${size}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 60%)`,
        }}
      />
      {/* Animated border (lights up only where cursor is) */}
      {borderGlow && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: opacity * 0.85,
            background: `radial-gradient(${size * 0.9}px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 45%)`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            maskComposite: "exclude",
            padding: 1,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </Tag>
  );
}

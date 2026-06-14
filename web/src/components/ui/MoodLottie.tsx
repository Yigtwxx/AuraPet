"use client";

import { useEffect, useRef } from "react";
const LOTTIE_PATHS: Record<string, string> = {
  HAPPY:   "/lottie/happy.json",
  NEUTRAL: "/lottie/neutral.json",
  SAD:     "/lottie/sad.json",
  ANXIOUS: "/lottie/anxious.json",
};

interface MoodLottieProps {
  mood: string;
  size?: number;
  loop?: boolean;
  className?: string;
}

export default function MoodLottie({ mood, size = 80, loop = true, className }: MoodLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const path = LOTTIE_PATHS[mood] ?? LOTTIE_PATHS.NEUTRAL;

  useEffect(() => {
    let player: { destroy?: () => void } | null = null;

    async function init() {
      try {
        const { default: lottie } = await import("lottie-web");
        const resp = await fetch(path);
        const data = await resp.json();
        if (!containerRef.current) return;
        player = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop,
          autoplay: true,
          animationData: data,
        });
      } catch {
        // Lottie not available or fetch failed — container stays empty (invisible fallback)
      }
    }

    init();
    return () => { player?.destroy?.(); };
  }, [path, loop]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

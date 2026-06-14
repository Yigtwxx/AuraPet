"use client";

import AurionView from "./aurion/AurionView";

const MOOD_COLORS: Record<string, string> = {
  HAPPY:   "#FFD700",
  NEUTRAL: "#95A5A6",
  SAD:     "#5B9BD5",
  ANXIOUS: "#9B59B6",
};

interface PetAvatarProps {
  mood: string;
  level: number;
  color: string;
  size?: number;
}

export default function PetAvatar({ mood, level, color, size = 160 }: PetAvatarProps) {
  const moodColor = MOOD_COLORS[mood] ?? color;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Radial mood-glow halo */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 60%, ${moodColor}22 0%, transparent 70%)`,
          filter: "blur(8px)",
          transform: "scale(1.2)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${moodColor}10 0%, transparent 65%)`,
          transform: "scale(1.4)",
        }}
      />
      <AurionView mood={mood} level={level} color={color} size={size} />
    </div>
  );
}

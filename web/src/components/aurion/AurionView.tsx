"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getForm } from "@/lib/aurion";
import AurionSpark   from "./AurionSpark";
import AurionDrift   from "./AurionDrift";
import AurionGlimmer from "./AurionGlimmer";
import AurionAether  from "./AurionAether";
import AurionNova    from "./AurionNova";

const FORM_COMPONENTS = {
  spark:   AurionSpark,
  drift:   AurionDrift,
  glimmer: AurionGlimmer,
  aether:  AurionAether,
  nova:    AurionNova,
} as const;

interface AurionViewProps {
  mood:   string;
  level:  number;
  color:  string;
  size?:  number;
}

export default function AurionView({ level, color, size = 160 }: AurionViewProps) {
  const reducedMotion = useReducedMotion();
  const prevLevel     = useRef(level);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (level > prevLevel.current && !reducedMotion) {
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 800);
      return () => clearTimeout(t);
    }
    prevLevel.current = level;
  }, [level, reducedMotion]);

  const form      = getForm(level);
  const FormShape = FORM_COMPONENTS[form];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* idle bob wrapper */}
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
        transition={reducedMotion ? undefined : { duration: 2.4, ease: "easeInOut" as const, repeat: Infinity }}
        className="w-full h-full"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={form}
            initial={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={reducedMotion ? {} : { opacity: 1, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full h-full"
          >
            <FormShape color={color} size={size} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* level-up gradient ring flash */}
      <AnimatePresence>
        {flashing && (
          <motion.div
            key="flash"
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0.9, scale: 1.2 }}
            animate={{ opacity: 0, scale: 1.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              background: `radial-gradient(circle, ${color}60 0%, ${color}00 70%)`,
              boxShadow: `0 0 40px ${color}80`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

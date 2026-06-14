"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, motion, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function AnimatedNumber({
  value,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 15 });
  const display = useTransform(spring, (v) =>
    `${prefix}${decimals > 0 ? v.toFixed(decimals) : Math.round(v)}${suffix}`
  );
  const prev = useRef(0);

  useEffect(() => {
    mv.set(prev.current);
    spring.set(prev.current);
    mv.set(value);
    prev.current = value;
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <motion.span className={cn("tabular-nums", className)}>{display}</motion.span>;
}

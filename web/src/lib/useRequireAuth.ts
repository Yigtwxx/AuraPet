"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserId } from "./session";

export function useRequireAuth() {
  const router = useRouter();

  // Lazy initializer runs once on client — no setState in effect
  const [userId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return getUserId();
  });

  useLayoutEffect(() => {
    if (!userId) router.replace("/login");
  }, [userId, router]);

  return { userId, checking: !userId };
}

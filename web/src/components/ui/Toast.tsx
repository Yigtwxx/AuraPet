"use client";

import { toast as sonnerToast } from "sonner";

type ToastType = "error" | "info" | "success" | "warning";

export function useToast() {
  const showToast = (message: string, type: ToastType = "info") => {
    switch (type) {
      case "error":   return sonnerToast.error(message);
      case "success": return sonnerToast.success(message);
      case "warning": return sonnerToast.warning(message);
      default:        return sonnerToast(message);
    }
  };
  return { showToast };
}

// Legacy provider shim — Sonner Toaster is now in lib/providers.tsx
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

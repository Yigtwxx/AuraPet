"use client";

import { useEffect } from "react";
import Link from "next/link";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Geliştirme/üretimde hatayı görünür kıl (gerçek projede bir log servisine gider)
    console.error("[AuraPet] Beklenmedik hata:", error);
  }, [error]);

  return (
    <main
      className="relative min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <ErrorState
          message="Beklenmedik bir hata oluştu. Tekrar deneyebilir ya da ana sayfaya dönebilirsin."
          onRetry={reset}
        />
        <div className="flex justify-center mt-1">
          <Link href="/">
            <Button variant="ghost" size="sm">Ana sayfaya dön</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

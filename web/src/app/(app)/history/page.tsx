"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_LOGS } from "@/graphql/operations";
import { getUserId } from "@/lib/session";

function scoreToColor(score: number): string {
  if (score > 0.25) return "#FFD700";
  if (score >= -0.25) return "#95A5A6";
  if (score >= -0.65) return "#5B9BD5";
  return "#9B59B6";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = getUserId();
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);
  }, [router]);

  const { data, loading } = useQuery(GET_LOGS, {
    variables: { userId },
    skip: !userId,
  });

  if (!userId || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <p className="text-aura-muted text-sm">Yükleniyor...</p>
      </div>
    );
  }

  const logs: {
    id: string;
    entryText: string;
    sentimentScore: number;
    createdAt: string;
  }[] = data?.getLogs ?? [];

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Geçmiş</h2>
      <p className="text-aura-muted text-sm mb-8">
        Önceki günlük notların ve duygu skorların.
      </p>

      {logs.length === 0 ? (
        <p className="text-aura-muted text-sm">Henüz günlük notu yok.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => {
            const color = scoreToColor(log.sentimentScore);
            const preview =
              log.entryText.length > 80
                ? log.entryText.slice(0, 80) + "..."
                : log.entryText;
            return (
              <div
                key={log.id}
                className="bg-aura-panel border border-aura-border rounded-xl px-5 py-4 relative overflow-hidden"
              >
                <div
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
                  style={{ backgroundColor: color }}
                />
                <div className="flex justify-between items-start gap-4 pl-2">
                  <p className="text-sm text-aura-text leading-relaxed flex-1">
                    {preview}
                  </p>
                  <span
                    className="text-xs font-bold shrink-0 tabular-nums"
                    style={{ color }}
                  >
                    {log.sentimentScore >= 0 ? "+" : ""}
                    {log.sentimentScore.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-aura-muted mt-2 pl-2">
                  {formatDate(log.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

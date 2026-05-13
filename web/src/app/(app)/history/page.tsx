"use client";

import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { GET_LOGS } from "@/graphql/operations";
import { useRequireAuth } from "@/lib/useRequireAuth";
import MoodChart from "@/components/MoodChart";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

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

function avgScore(logs: { sentimentScore: number }[]): number {
  if (!logs.length) return 0;
  return logs.reduce((s, l) => s + l.sentimentScore, 0) / logs.length;
}

function maxStreak(logs: { sentimentScore: number }[]): number {
  let max = 0, cur = 0;
  for (const l of logs) {
    if (l.sentimentScore > 0) { cur++; max = Math.max(max, cur); }
    else cur = 0;
  }
  return max;
}

interface Log {
  id: string;
  entryText: string;
  sentimentScore: number;
  createdAt: string;
}

export default function HistoryPage() {
  const { userId, checking } = useRequireAuth();

  const { data, loading } = useQuery(GET_LOGS, {
    variables: { userId },
    skip: !userId,
  });

  if (checking || !userId || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <p className="text-aura-muted text-sm">Yükleniyor...</p>
      </div>
    );
  }

  const logs: Log[] = data?.getLogs ?? [];
  const avg = avgScore(logs);
  const streak = maxStreak(logs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl"
    >
      <SectionHeading
        eyebrow="Analitik"
        title="Geçmiş"
        subtitle="Önceki günlük notların ve duygu skorların."
        className="mb-8"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Toplam Kayıt", value: logs.length, suffix: "" },
          { label: "Ort. Skor", value: parseFloat(avg.toFixed(2)), suffix: "" },
          { label: "En Uzun Seri", value: streak, suffix: "" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard className="p-4 text-center">
              <AnimatedNumber
                value={kpi.value}
                decimals={kpi.label === "Ort. Skor" ? 2 : 0}
                className="text-2xl font-bold text-aura-text block"
                prefix={kpi.label === "Ort. Skor" && avg >= 0 ? "+" : ""}
              />
              <p className="text-xs text-aura-muted mt-1">{kpi.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {logs.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-5 mb-6">
            <p className="text-xs text-aura-muted mb-4 font-medium uppercase tracking-widest">
              Duygu Trendi
            </p>
            <MoodChart logs={logs} />
          </GlassCard>
        </motion.div>
      )}

      {/* Log timeline */}
      {logs.length === 0 ? (
        <p className="text-aura-muted text-sm">Henüz günlük notu yok.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {logs.map((log, i) => {
            const color = scoreToColor(log.sentimentScore);
            const preview =
              log.entryText.length > 100
                ? log.entryText.slice(0, 100) + "..."
                : log.entryText;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="relative overflow-hidden rounded-xl group hover:scale-[1.005] transition-transform duration-200"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--color-border-subtle)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Left color rail */}
                <div
                  className="absolute left-0 top-0 w-0.5 h-full rounded-full"
                  style={{
                    background: `linear-gradient(180deg, ${color}, ${color}40)`,
                    boxShadow: `2px 0 8px ${color}30`,
                  }}
                />

                <div className="flex justify-between items-start gap-4 pl-4 pr-4 py-4">
                  <p className="text-sm text-aura-text leading-relaxed flex-1">{preview}</p>
                  <span
                    className="text-xs font-bold shrink-0 tabular-nums"
                    style={{ color }}
                  >
                    {log.sentimentScore >= 0 ? "+" : ""}
                    {log.sentimentScore.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-aura-muted pb-2.5 pl-4 pr-4">
                  {formatDate(log.createdAt)}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

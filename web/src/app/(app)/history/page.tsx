"use client";

import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import { motion } from "framer-motion";
import { TrendingUp, Flame, FileText } from "lucide-react";
import { GET_LOGS } from "@/graphql/operations";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/ui/Toast";
import MoodChart from "@/components/MoodChart";
import Card from "@/components/ui/Card";
import Spotlight from "@/components/ui/Spotlight";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { cn } from "@/lib/cn";

function scoreToColor(score: number): string {
  if (score > 0.25) return "var(--color-success)";
  if (score >= -0.25) return "var(--color-sentiment-neutral)";
  return "var(--color-danger)";
}

function scoreToLabel(score: number): string {
  if (score > 0.25) return "Pozitif";
  if (score >= -0.25) return "Nötr";
  return "Negatif";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function avgScore(logs: { sentimentScore: number }[]): number {
  if (!logs.length) return 0;
  return logs.reduce((s, l) => s + l.sentimentScore, 0) / logs.length;
}

function maxStreak(logs: { sentimentScore: number }[]): number {
  let max = 0, cur = 0;
  for (const l of logs) {
    if (l.sentimentScore > 0) { cur++; max = Math.max(max, cur); } else cur = 0;
  }
  return max;
}

interface Log { id: string; entryText: string; sentimentScore: number; createdAt: string; }

function KpiTile({ label, value, icon, accent, decimals = 0, prefix = "", delay = 0 }: {
  label: string; value: number; icon: React.ReactNode; accent: string;
  decimals?: number; prefix?: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Spotlight className="rounded-[var(--radius-xl)]" color={`${accent}22`}>
        <Card variant="raised" padding="md">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-tertiary)]">{label}</p>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accent}1c`, border: `1px solid ${accent}3a`, color: accent }}>
              {icon}
            </div>
          </div>
          <AnimatedNumber
            value={value}
            decimals={decimals}
            prefix={prefix}
            className="text-[26px] font-bold tracking-tight tabular-nums text-[var(--color-text-primary)] block leading-none"
          />
        </Card>
      </Spotlight>
    </motion.div>
  );
}

function HistorySkeletons() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Card key={i} variant="raised" padding="md">
            <Skeleton className="h-3 w-1/2 mb-3" />
            <Skeleton className="h-7 w-2/3" />
          </Card>
        ))}
      </div>
      <Card variant="raised" padding="md">
        <Skeleton className="h-3 w-1/4 mb-4" />
        <Skeleton className="h-40 w-full" rounded="lg" />
      </Card>
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} variant="flat" padding="md">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2 mb-1" />
          <Skeleton className="h-3 w-1/3" />
        </Card>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { userId, checking } = useRequireAuth();
  const { showToast } = useToast();

  const { data, loading, error, refetch } = useQuery(GET_LOGS, {
    variables: { userId },
    skip: !userId,
    // Mobilde eklenen günlükler sayfaya dönüldüğünde DB'den tazelensin.
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (error) showToast(error.message, "error");
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking || !userId) return null;

  const logs: Log[] = data?.getLogs ?? [];
  const avg = avgScore(logs);
  const streak = maxStreak(logs);
  const avgAccent = avg >= 0 ? "#22c55e" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <SectionHeading eyebrow="Analitik" title="Duygu Geçmişin" subtitle="Günlük notların, duygu skorların ve eğilimlerin." />
      </div>

      {loading ? (
        <HistorySkeletons />
      ) : error && !data ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
            <KpiTile label="Toplam Kayıt" value={logs.length} icon={<FileText size={14} strokeWidth={2.2} />} accent="#26A6A0" delay={0} />
            <KpiTile label="Ortalama Skor" value={parseFloat(avg.toFixed(2))} icon={<TrendingUp size={14} strokeWidth={2.2} />} accent={avgAccent} decimals={2} prefix={avg >= 0 ? "+" : ""} delay={0.07} />
            <KpiTile label="En Uzun Seri" value={streak} icon={<Flame size={14} strokeWidth={2.2} />} accent="#FBBF24" delay={0.14} />
          </div>

          {/* Chart */}
          {logs.length >= 2 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <Card variant="raised" padding="md" className="mb-7">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Duygu Trendi</p>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-tertiary)]">
                    <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />Pozitif</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-danger)]" />Negatif</span>
                  </div>
                </div>
                <MoodChart logs={logs} />
              </Card>
            </motion.div>
          )}

          {/* Timeline */}
          <div className="flex items-baseline justify-between mb-3 px-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)]">Kayıtlar</p>
            <p className="text-[11px] text-[var(--color-text-tertiary)]">{logs.length} giriş</p>
          </div>

          {logs.length === 0 ? (
            <Card variant="flat" padding="lg">
              <EmptyState
                icon={<PenLine size={40} />}
                title="Henüz günlük notu yok"
                description="İlk kaydını ekle — Aurion seni tanımaya başlasın."
                action={
                  <Link href="/log">
                    <Button variant="secondary" size="sm">İlk Günlüğü Yaz</Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="flex flex-col gap-2.5">
              {logs.map((log, i) => {
                const color = scoreToColor(log.sentimentScore);
                const label = scoreToLabel(log.sentimentScore);
                const preview = log.entryText.length > 140 ? log.entryText.slice(0, 140) + "…" : log.entryText;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl group",
                      "border border-[var(--color-border-subtle)] bg-[var(--color-surface-base)]",
                      "transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 hover:border-[var(--color-border-strong)]",
                    )}
                  >
                    <div className="absolute left-0 top-0 w-[3px] h-full" style={{ background: color }} />
                    <div className="pl-5 pr-4 py-4">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <p className="text-sm text-[var(--color-text-primary)] leading-relaxed flex-1">{preview}</p>
                        <span className="text-[11px] font-bold tabular-nums shrink-0 px-2 py-0.5 rounded-full" style={{ color, background: `${color}18`, border: `1px solid ${color}28` }}>
                          {log.sentimentScore >= 0 ? "+" : ""}{log.sentimentScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-faint)]">
                        <span className="font-semibold uppercase tracking-wider" style={{ color }}>{label}</span>
                        <span>·</span>
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

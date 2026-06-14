"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wand2, Sun, Cloud, Wind } from "lucide-react";
import { ADD_LOG_ENTRY } from "@/graphql/operations";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/ui/Toast";
import PetAvatar from "@/components/PetAvatar";
import XpBar from "@/components/XpBar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SentimentChip from "@/components/ui/SentimentChip";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import MoodLottie from "@/components/ui/MoodLottie";
import { cn } from "@/lib/cn";

interface LogAnalysis {
  sentimentLabel: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentimentScore: number;
  pet: {
    name: string;
    level: number;
    xp: number;
    currentMood: string;
    colorTheme: string;
  };
}

const MAX_CHARS = 500;
const DRAFT_KEY = "aurapet_log_draft";

const SUGGESTIONS = [
  { icon: <Sun size={14} />, text: "Bugün enerjik ve umutluyum, harika bir gün geçirdim." },
  { icon: <Cloud size={14} />, text: "Bugün biraz yorgun ve gergin hissediyorum." },
  { icon: <Wind size={14} />, text: "Sakin ve dengeli bir gün geçirdim." },
];

export default function LogPage() {
  const { userId, checking } = useRequireAuth();
  const { showToast } = useToast();
  const [entryText, setEntryText] = useState("");
  const [result, setResult] = useState<LogAnalysis | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Draft persistence — mount'ta kayıtlı taslağı geri yükle (hidrasyon güvenli).
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(DRAFT_KEY) : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setEntryText(saved);
  }, []);

  useEffect(() => {
    if (entryText) localStorage.setItem(DRAFT_KEY, entryText);
    else localStorage.removeItem(DRAFT_KEY);
  }, [entryText]);

  // ⌘+Enter to submit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        textareaRef.current?.form?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [addLogEntry, { loading }] = useMutation(ADD_LOG_ENTRY, {
    onCompleted: (data) => {
      setResult(data.addLogEntry);
      setEntryText("");
      localStorage.removeItem(DRAFT_KEY);
    },
    onError: (err) => showToast(err.message, "error"),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entryText.trim() || !userId || isOverLimit) return;
    setResult(null);
    await addLogEntry({ variables: { userId, entryText: entryText.trim() } });
  }

  const charCount = entryText.length;
  const isOverLimit = charCount > MAX_CHARS;
  const pct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const circumference = 2 * Math.PI * 16;

  if (checking || !userId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <SectionHeading
          eyebrow="Günlük · AI Analizi"
          title="Bugün nasıl hissediyorsun?"
          subtitle="Birkaç cümle yaz — Aurion duygunu analiz edip sana göre evrim geçirecek."
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* ── Left: Input panel ── */}
        <div className="flex flex-col gap-4">
          <Card variant="raised" padding="none">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--color-border-faint)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--color-brand-soft)", border: "1px solid rgba(38,166,160,0.25)" }}>
                    <Wand2 size={13} className="text-[var(--color-brand-400)]" />
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Yeni Günlük Kaydı</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-400)]">
                  TR · BERT
                </span>
              </div>

              {/* Textarea */}
              <div className="relative flex-1 px-6 pt-4 pb-3">
                <textarea
                  ref={textareaRef}
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  placeholder="Bugün neler yaşadın? Nasıl hissediyorsun?&#10;&#10;Türkçe yaz — model duygunu analiz edecek."
                  className={cn(
                    "w-full min-h-[200px] resize-none bg-transparent",
                    "text-sm leading-relaxed text-[var(--color-text-primary)]",
                    "placeholder:text-[var(--color-text-faint)]",
                    "focus:outline-none",
                    isOverLimit && "text-[var(--color-danger)]",
                  )}
                  style={{ field_sizing: "content" } as React.CSSProperties}
                  aria-label="Günlük metni"
                  aria-describedby="char-counter"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border-faint)]">
                <div className="flex items-center gap-3">
                  {/* Circular char counter */}
                  <div id="char-counter" className="relative h-9 w-9 shrink-0" role="progressbar" aria-valuemin={0} aria-valuemax={MAX_CHARS} aria-valuenow={charCount}>
                    <svg className="h-9 w-9 -rotate-90" viewBox="0 0 40 40" aria-hidden>
                      <circle cx="20" cy="20" r="16" fill="none" stroke="var(--color-border-subtle)" strokeWidth="3" />
                      <circle
                        cx="20" cy="20" r="16" fill="none"
                        stroke={isOverLimit ? "var(--color-danger)" : pct > 80 ? "var(--color-warning)" : "var(--color-brand-500)"}
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference - (circumference * pct) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-[var(--duration-fast)]"
                      />
                    </svg>
                    <span className={cn("absolute inset-0 flex items-center justify-center text-[9px] font-semibold", isOverLimit ? "text-[var(--color-danger)]" : "text-[var(--color-text-tertiary)]")}>
                      {isOverLimit ? `-${charCount - MAX_CHARS}` : MAX_CHARS - charCount}
                    </span>
                  </div>
                  <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[var(--color-text-faint)] border border-[var(--color-border-faint)] rounded px-1.5 py-0.5">
                    <span className="font-mono">⌘</span>↵
                  </kbd>
                </div>
                <Button type="submit" disabled={!entryText.trim() || isOverLimit} loading={loading} rightIcon={<Sparkles size={13} />}>
                  {loading ? "Analiz ediliyor…" : "Gönder"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Suggestions */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)] px-1">Öneri</p>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => setEntryText(s.text)}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-left",
                  "border border-[var(--color-border-faint)] bg-[var(--color-surface-glass)]",
                  "hover:border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-glass-hover)]",
                  "transition-colors duration-[var(--duration-fast)]",
                  "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
                )}
                aria-label={`Öneri: ${s.text}`}
              >
                <span className="shrink-0 mt-0.5 text-[var(--color-text-faint)]">{s.icon}</span>
                <span className="leading-relaxed">{s.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Result panel ── */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1"
              >
                <Card variant="raised" padding="lg" className="text-center space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-[var(--color-surface-glass-strong)] animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 rounded-md bg-[var(--color-surface-glass-strong)] animate-pulse mx-auto w-2/3" />
                    <div className="h-3 rounded-md bg-[var(--color-surface-glass-strong)] animate-pulse mx-auto w-1/2" />
                  </div>
                  <p className="text-xs text-[var(--color-text-faint)] animate-pulse">BERT modeli analiz ediyor…</p>
                </Card>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card variant="raised" padding="lg" className="text-center">
                  {/* Mood Lottie + Avatar stacked */}
                  <div className="relative mx-auto mb-4 w-fit">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MoodLottie mood={result.pet.currentMood} size={140} loop />
                    </div>
                    <PetAvatar mood={result.pet.currentMood} level={result.pet.level} color={result.pet.colorTheme} size={96} />
                  </div>

                  <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">{result.pet.name}</h3>
                  <p className="text-xs text-[var(--color-text-tertiary)] mb-4">Seviye {result.pet.level}</p>

                  <div className="flex items-center justify-center gap-2 mb-5">
                    <SentimentChip label={result.sentimentLabel} />
                    <span className="text-sm font-semibold tabular-nums text-[var(--color-text-secondary)]">
                      <AnimatedNumber value={Math.abs(result.sentimentScore)} decimals={2} />
                    </span>
                  </div>

                  <XpBar xp={result.pet.xp} level={result.pet.level} color={result.pet.colorTheme} />

                  <p className="mt-4 text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider">
                    +XP kazanıldı — Aurion evrimleşti
                  </p>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <Card variant="flat" padding="lg" className="text-center">
                  <div className="py-8 flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-[var(--color-surface-glass-strong)] flex items-center justify-center">
                      <Wand2 size={24} className="text-[var(--color-text-faint)]" />
                    </div>
                    <p className="text-sm text-[var(--color-text-tertiary)]">Günlüğünü gönder, Aurion tepkisini burada göreceksin.</p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

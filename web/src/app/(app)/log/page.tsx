"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import { ADD_LOG_ENTRY } from "@/graphql/operations";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/ui/Toast";
import PetAvatar from "@/components/PetAvatar";
import XpBar from "@/components/XpBar";
import GlassCard from "@/components/ui/GlassCard";
import MoodChip from "@/components/ui/MoodChip";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface PetResult {
  name: string;
  level: number;
  xp: number;
  currentMood: string;
  colorTheme: string;
}

const MAX_CHARS = 500;

export default function LogPage() {
  const { userId, checking } = useRequireAuth();
  const { showToast } = useToast();
  const [entryText, setEntryText] = useState("");
  const [result, setResult] = useState<PetResult | null>(null);

  const [addLogEntry, { loading }] = useMutation(ADD_LOG_ENTRY, {
    onCompleted: (data) => {
      setResult(data.addLogEntry);
      setEntryText("");
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entryText.trim() || !userId) return;
    setResult(null);
    try {
      await addLogEntry({ variables: { userId, entryText: entryText.trim() } });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Günlük eklenirken hata oluştu", "error");
    }
  }

  const charCount = entryText.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl"
    >
      <SectionHeading
        eyebrow="Günlük"
        title="Bugün nasılsın?"
        subtitle="Petın duygularını okuyup buna göre evrilecek."
        className="mb-8"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  placeholder="Bugün çok mutluyum, harika bir gün geçirdim!"
                  required
                  rows={6}
                  className="w-full rounded-xl px-4 py-3 text-aura-text placeholder-aura-muted/60 text-sm resize-none focus:outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: isOverLimit
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid var(--color-border-strong)",
                  }}
                  onFocus={(e) => {
                    if (!isOverLimit) {
                      e.target.style.borderColor = "#7C5CFF60";
                      e.target.style.boxShadow = "0 0 0 3px rgba(124,92,255,0.1)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isOverLimit
                      ? "rgba(239,68,68,0.5)"
                      : "var(--color-border-strong)";
                    e.target.style.boxShadow = "";
                  }}
                />
                {/* Character counter */}
                <span
                  className="absolute bottom-3 right-3 text-xs tabular-nums"
                  style={{ color: isOverLimit ? "#f87171" : "var(--color-aura-muted)" }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || checking || !entryText.trim() || isOverLimit}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #7C5CFF, #9B59B6)",
                  boxShadow: "0 4px 20px rgba(124,92,255,0.25)",
                }}
              >
                {loading ? "Analiz ediliyor..." : "Günlüğe Ekle"}
              </button>
            </form>
          </GlassCard>

          {/* Tips */}
          <p className="text-xs text-aura-muted/60 text-center px-2">
            Türkçe yaz — AI duygunu analiz edip petını güncelleyecek.
          </p>
        </div>

        {/* Right: Result */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={result.currentMood + result.xp}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <GlassCard glow moodColor={result.colorTheme} className="p-5 h-full">
                <p className="text-xs text-aura-muted mb-4 font-medium uppercase tracking-wide">
                  Petın güncellendi ✨
                </p>

                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <PetAvatar
                      mood={result.currentMood}
                      level={result.level}
                      color={result.colorTheme}
                      size={100}
                    />
                  </motion.div>

                  <div className="w-full text-center">
                    <h3 className="text-base font-bold text-aura-text">{result.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1.5 mb-3">
                      <MoodChip mood={result.currentMood} size="sm" />
                      <span className="text-xs text-aura-muted">
                        Seviye{" "}
                        <AnimatedNumber value={result.level} className="font-bold text-aura-text" />
                      </span>
                    </div>
                    <XpBar xp={result.xp} level={result.level} color={result.colorTheme} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden lg:flex items-center justify-center"
            >
              <GlassCard className="p-8 text-center w-full">
                <div className="opacity-10 flex justify-center mb-3">
                  <svg width="64" height="64" viewBox="0 0 200 200" fill="none">
                    <ellipse cx="100" cy="108" rx="55" ry="55" fill="#7C5CFF"/>
                    <ellipse cx="60" cy="68" rx="18" ry="24" fill="#9B59B6"/>
                    <ellipse cx="140" cy="68" rx="18" ry="24" fill="#9B59B6"/>
                  </svg>
                </div>
                <p className="text-xs text-aura-muted">
                  Günlüğünü yazdıktan sonra<br />petın burada görünecek.
                </p>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

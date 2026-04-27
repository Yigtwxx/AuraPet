"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { ADD_LOG_ENTRY } from "@/graphql/operations";
import { getUserId } from "@/lib/session";

const MOOD_LABEL: Record<string, string> = {
  HAPPY: "Mutlu 😄",
  NEUTRAL: "Nötr 😐",
  SAD: "Üzgün 😔",
  ANXIOUS: "Endişeli 😰",
};

export default function LogPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [entryText, setEntryText] = useState("");
  const [result, setResult] = useState<{
    name: string;
    level: number;
    xp: number;
    currentMood: string;
    colorTheme: string;
  } | null>(null);

  useEffect(() => {
    const id = getUserId();
    if (!id) {
      router.replace("/login");
      return;
    }
    setUserId(id);
  }, [router]);

  const [addLogEntry, { loading, error }] = useMutation(ADD_LOG_ENTRY, {
    onCompleted: (data) => {
      setResult(data.addLogEntry);
      setEntryText("");
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!entryText.trim() || !userId) return;
    await addLogEntry({ variables: { userId, entryText: entryText.trim() } });
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold mb-1">Günlük Ekle</h2>
      <p className="text-aura-muted text-sm mb-8">
        Bugün nasıl hissediyorsun? Petın sana göre evrilecek.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={entryText}
          onChange={(e) => setEntryText(e.target.value)}
          placeholder="Bugün çok mutluyum, harika bir gün geçirdim!"
          required
          rows={5}
          className="rounded-xl px-4 py-3 bg-aura-panel border border-aura-border text-aura-text placeholder-aura-muted focus:outline-none focus:border-aura-accent transition-colors text-sm resize-none"
        />

        {error && (
          <p className="text-red-400 text-sm rounded-lg bg-red-400/10 px-3 py-2">
            {error.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !entryText.trim()}
          className="py-3 rounded-xl bg-aura-accent text-white font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? "Analiz ediliyor..." : "Günlüğe Ekle"}
        </button>
      </form>

      {result && (
        <div
          className="mt-8 bg-aura-panel border rounded-2xl p-6 relative overflow-hidden"
          style={{ borderColor: result.colorTheme }}
        >
          <div
            className="absolute top-0 left-0 h-1 w-full"
            style={{ backgroundColor: result.colorTheme }}
          />
          <p className="text-xs text-aura-muted mb-2">Petın güncellendi</p>
          <h3 className="text-lg font-bold">{result.name}</h3>
          <p className="text-sm font-medium mt-1" style={{ color: result.colorTheme }}>
            {MOOD_LABEL[result.currentMood] ?? result.currentMood}
          </p>
          <div className="mt-4 flex gap-6 text-sm text-aura-muted">
            <span>
              Seviye <span className="text-aura-text font-bold">{result.level}</span>
            </span>
            <span>
              XP <span className="text-aura-text font-bold">{result.xp}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { GET_USER_PETS, CREATE_PET } from "@/graphql/operations";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useToast } from "@/components/ui/Toast";
import PetAvatar from "@/components/PetAvatar";
import XpBar from "@/components/XpBar";
import GlassCard from "@/components/ui/GlassCard";
import MoodChip from "@/components/ui/MoodChip";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface Pet {
  id: string;
  name: string;
  level: number;
  xp: number;
  currentMood: string;
  colorTheme: string;
}

const FORM_NAMES: Record<number, string> = {
  1: "Kıvılcım", 2: "Süzgün", 3: "Parıltı", 4: "Esir", 5: "Nova",
};

export default function DashboardPage() {
  const { userId, checking } = useRequireAuth();
  const { showToast } = useToast();
  const [petName, setPetName] = useState("");

  const { data, loading, error: queryError, refetch } = useQuery(GET_USER_PETS, {
    variables: { userId },
    skip: !userId,
  });

  const [createPet, { loading: creating }] = useMutation(CREATE_PET, {
    onCompleted: () => refetch(),
  });

  useEffect(() => {
    if (queryError) showToast(queryError.message, "error");
  }, [queryError]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreatePet(e: React.FormEvent) {
    e.preventDefault();
    if (!petName.trim() || !userId) return;
    await createPet({ variables: { userId, name: petName.trim() } });
    setPetName("");
  }

  if (checking || !userId || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-aura-accent)", borderTopColor: "transparent" }}
          />
          <p className="text-aura-muted text-sm">Yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  const pets: Pet[] = data?.getUserPets ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl"
    >
      <SectionHeading
        eyebrow="Koleksiyon"
        title="Aurion’ların"
        subtitle="Petlarının evrim durumuna göz at."
        className="mb-8"
      />

      {pets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <GlassCard className="p-8 text-center">
            {/* Empty state silhouette */}
            <div className="flex justify-center mb-6 opacity-20">
              <svg width="80" height="80" viewBox="0 0 200 200" fill="none">
                <ellipse cx="100" cy="108" rx="55" ry="55" fill="#7C5CFF"/>
                <ellipse cx="60" cy="68" rx="18" ry="24" fill="#9B59B6"/>
                <ellipse cx="140" cy="68" rx="18" ry="24" fill="#9B59B6"/>
                <ellipse cx="100" cy="116" rx="12" ry="8" fill="white" opacity="0.4"/>
              </svg>
            </div>
            <p className="text-aura-text font-medium mb-1">Henüz bir petin yok</p>
            <p className="text-aura-muted text-sm mb-6">{"İlk Aurion'unu oluştur ve yolculuğuna başla."}</p>

            <form onSubmit={handleCreatePet} className="flex gap-3 max-w-xs mx-auto">
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Aurion'un adı"
                required
                className="flex-1 rounded-xl px-4 py-2.5 text-aura-text placeholder-aura-muted text-sm focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--color-border-strong)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7C5CFF"; e.target.style.boxShadow = "0 0 0 3px rgba(124,92,255,0.15)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-border-strong)"; e.target.style.boxShadow = ""; }}
              />
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #7C5CFF, #9B59B6)" }}
              >
                {creating ? "..." : "Oluştur"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {pets.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <GlassCard
                  glow
                  moodColor={pet.colorTheme}
                  className="p-6 hover:scale-[1.005] hover:-translate-y-0.5 transition-transform duration-300"
                >
                  <div className="flex items-center gap-6">
                    {/* Pet avatar with halo */}
                    <div className="shrink-0">
                      <PetAvatar mood={pet.currentMood} level={pet.level} color={pet.colorTheme} size={110} />
                    </div>

                    {/* Pet info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3
                            className="text-lg font-bold text-aura-text leading-tight"
                          >
                            {pet.name}
                          </h3>
                          <p className="text-xs text-aura-muted mt-0.5">
                            {FORM_NAMES[Math.min(pet.level, 5)] ?? "Nova"} formu
                          </p>
                        </div>

                        {/* Level badge */}
                        <div
                          className="shrink-0 flex flex-col items-center px-3 py-1.5 rounded-xl"
                          style={{
                            background: `${pet.colorTheme}18`,
                            border: `1px solid ${pet.colorTheme}30`,
                          }}
                        >
                          <span className="text-xs text-aura-muted leading-none mb-0.5">Seviye</span>
                          <span
                            className="text-xl font-bold leading-none tabular-nums"
                            style={{ color: pet.colorTheme }}
                          >
                            {pet.level}
                          </span>
                        </div>
                      </div>

                      <MoodChip mood={pet.currentMood} />
                      <XpBar xp={pet.xp} level={pet.level} color={pet.colorTheme} />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add more pet shortcut */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: pets.length * 0.07 + 0.1 }}
          >
            <form onSubmit={handleCreatePet} className="flex gap-3">
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Yeni Aurion adı..."
                className="flex-1 rounded-xl px-4 py-2.5 text-aura-text placeholder-aura-muted text-sm focus:outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--color-border-subtle)",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7C5CFF40"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--color-border-subtle)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
              />
              <button
                type="submit"
                disabled={creating || !petName.trim()}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 disabled:opacity-30 active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #7C5CFF, #9B59B6)" }}
              >
                {creating ? "..." : "+ Ekle"}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

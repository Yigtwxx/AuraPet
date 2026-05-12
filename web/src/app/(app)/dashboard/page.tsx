"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import { GET_USER_PETS, CREATE_PET } from "@/graphql/operations";
import { getUserId } from "@/lib/session";
import PetAvatar from "@/components/PetAvatar";
import XpBar from "@/components/XpBar";

const MOOD_LABEL: Record<string, string> = {
  HAPPY:   "Mutlu 😄",
  NEUTRAL: "Nötr 😐",
  SAD:     "Üzgün 😔",
  ANXIOUS: "Endişeli 😰",
};

interface Pet {
  id: string;
  name: string;
  level: number;
  xp: number;
  currentMood: string;
  colorTheme: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    const id = getUserId();
    if (!id) { router.replace("/login"); return; }
    setUserId(id);
  }, [router]);

  const { data, loading, refetch } = useQuery(GET_USER_PETS, {
    variables: { userId },
    skip: !userId,
  });

  const [createPet, { loading: creating }] = useMutation(CREATE_PET, {
    onCompleted: () => refetch(),
  });

  async function handleCreatePet(e: React.FormEvent) {
    e.preventDefault();
    if (!petName.trim() || !userId) return;
    await createPet({ variables: { userId, name: petName.trim() } });
    setPetName("");
  }

  if (!userId || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-aura-muted text-sm"
        >
          Yükleniyor...
        </motion.p>
      </div>
    );
  }

  const pets: Pet[] = data?.getUserPets ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl"
    >
      <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
      <p className="text-aura-muted text-sm mb-8">Petının durumuna göz at.</p>

      {pets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-aura-panel border border-aura-border rounded-2xl p-8"
        >
          <p className="text-aura-muted mb-6 text-sm">
            Henüz bir petin yok. Şimdi bir tane oluştur!
          </p>
          <form onSubmit={handleCreatePet} className="flex gap-3">
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="Petinin adı"
              required
              className="flex-1 rounded-lg px-4 py-2.5 bg-aura-bg border border-aura-border text-aura-text placeholder-aura-muted focus:outline-none focus:border-aura-accent transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2.5 rounded-lg bg-aura-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all active:scale-95"
            >
              {creating ? "..." : "Oluştur"}
            </button>
          </form>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-4">
          {pets.map((pet, i) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-aura-panel border border-aura-border rounded-2xl p-6 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{ backgroundColor: pet.colorTheme }}
              />

              <div className="flex items-center gap-6">
                <PetAvatar mood={pet.currentMood} level={pet.level} color={pet.colorTheme} size={110} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-aura-text">{pet.name}</h3>
                      <p
                        className="text-sm font-medium mt-0.5"
                        style={{ color: pet.colorTheme }}
                      >
                        {MOOD_LABEL[pet.currentMood] ?? pet.currentMood}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-aura-muted">Seviye</p>
                      <p className="text-2xl font-bold text-aura-accent">{pet.level}</p>
                    </div>
                  </div>
                  <XpBar xp={pet.xp} level={pet.level} color={pet.colorTheme} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

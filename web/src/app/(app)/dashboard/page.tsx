"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USER_PETS, CREATE_PET } from "@/graphql/operations";
import { getUserId } from "@/lib/session";

const MOOD_LABEL: Record<string, string> = {
  HAPPY: "Mutlu 😄",
  NEUTRAL: "Nötr 😐",
  SAD: "Üzgün 😔",
  ANXIOUS: "Endişeli 😰",
};

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [petName, setPetName] = useState("");

  useEffect(() => {
    const id = getUserId();
    if (!id) {
      router.replace("/login");
      return;
    }
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
        <p className="text-aura-muted text-sm">Yükleniyor...</p>
      </div>
    );
  }

  const pets: {
    id: string;
    name: string;
    level: number;
    xp: number;
    currentMood: string;
    colorTheme: string;
  }[] = data?.getUserPets ?? [];

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">Dashboard</h2>
      <p className="text-aura-muted text-sm mb-8">Petının durumuna göz at.</p>

      {pets.length === 0 ? (
        <div className="bg-aura-panel border border-aura-border rounded-2xl p-8">
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
              className="px-5 py-2.5 rounded-lg bg-aura-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {creating ? "..." : "Oluştur"}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-aura-panel border border-aura-border rounded-2xl p-6 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 h-1 w-full"
                style={{ backgroundColor: pet.colorTheme }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-aura-text">
                    {pet.name}
                  </h3>
                  <p
                    className="text-sm font-medium mt-1"
                    style={{ color: pet.colorTheme }}
                  >
                    {MOOD_LABEL[pet.currentMood] ?? pet.currentMood}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-aura-muted">Seviye</p>
                  <p className="text-2xl font-bold text-aura-accent">
                    {pet.level}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex justify-between text-xs text-aura-muted mb-1">
                  <span>XP</span>
                  <span>{pet.xp}</span>
                </div>
                <div className="h-2 rounded-full bg-aura-border overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: pet.colorTheme,
                      width: `${Math.min((pet.xp % 250) / 2.5, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

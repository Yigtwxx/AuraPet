"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import { GET_USER_PETS, CREATE_PET, UPDATE_PET, DELETE_PET } from "@/graphql/operations";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";
import PetAvatar from "@/components/PetAvatar";
import XpBar from "@/components/XpBar";
import Card from "@/components/ui/Card";
import Spotlight from "@/components/ui/Spotlight";
import Button from "@/components/ui/Button";
import MoodChip from "@/components/ui/MoodChip";
import SectionHeading from "@/components/ui/SectionHeading";
import { SkeletonCard } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import Input from "@/components/ui/Input";
import AurionView from "@/components/aurion/AurionView";

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
  const [addOpen, setAddOpen] = useState(false);
  const [menuPetId, setMenuPetId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [renamingPetId, setRenamingPetId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const { data, loading, error: queryError, refetch } = useQuery(GET_USER_PETS, {
    variables: { userId },
    skip: !userId,
    // Mobilde yapılan değişiklikler sayfaya dönüldüğünde DB'den tazelensin.
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (queryError) showToast(queryError.message, "error");
  }, [queryError]); // eslint-disable-line react-hooks/exhaustive-deps

  const [createPet, { loading: creating }] = useMutation(CREATE_PET, {
    onCompleted: () => { refetch(); setPetName(""); setAddOpen(false); showToast("Aurion oluşturuldu ✨", "success"); },
    onError: (e) => showToast(e.message, "error"),
  });

  const [updatePet, { loading: renaming }] = useMutation(UPDATE_PET, {
    onCompleted: () => { refetch(); showToast("İsim güncellendi", "success"); },
    onError: (e) => showToast(e.message, "error"),
  });

  const [deletePet] = useMutation(DELETE_PET, {
    onCompleted: () => { refetch(); showToast("Aurion serbest bırakıldı", "success"); },
    onError: (e) => showToast(e.message, "error"),
  });

  async function handleCreatePet(e: React.FormEvent) {
    e.preventDefault();
    if (!petName.trim() || !userId) return;
    await createPet({ variables: { userId, name: petName.trim() } });
  }

  // ── Pet options (rename / release) ──────────────────────────────────────
  function toggleMenu(id: string) {
    setMenuPetId((cur) => (cur === id ? null : id));
    setConfirmDelete(false);
  }
  function closeMenu() { setMenuPetId(null); setConfirmDelete(false); }

  function startRename(pet: Pet) {
    setRenamingPetId(pet.id);
    setRenameDraft(pet.name);
    closeMenu();
  }
  function cancelRename() { setRenamingPetId(null); setRenameDraft(""); }

  async function handleRename(pet: Pet) {
    const name = renameDraft.trim();
    if (!name || name === pet.name) { cancelRename(); return; }
    await updatePet({ variables: { petId: pet.id, name } });
    cancelRename();
  }

  async function handleDelete(pet: Pet) {
    closeMenu();
    await deletePet({ variables: { petId: pet.id } });
  }

  if (checking || !userId) return null;

  const pets: Pet[] = data?.getUserPets ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Koleksiyon"
          title="Aurion'ların"
          subtitle="Petlerinin evrim durumuna göz at ve yeni bir Aurion'a hayat ver."
        />
        <div className="flex items-center gap-3">
          {!loading && pets.length > 0 && (
            <div className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-tertiary)] px-3 py-1.5 rounded-full border border-[var(--color-border-faint)] bg-[var(--color-surface-glass)]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              {pets.length} Aktif
            </div>
          )}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} strokeWidth={2.4} />}
            onClick={() => setAddOpen((v) => !v)}
          >
            Yeni Aurion
          </Button>
        </div>
      </div>

      {/* Add pet form */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mb-6"
          >
            <Card variant="raised" padding="md">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Yeni Aurion adı</p>
              <form onSubmit={handleCreatePet} className="flex gap-2.5">
                <Input
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="örn. Lyra, Orion, Nyx…"
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" disabled={creating || !petName.trim()} loading={creating} rightIcon={<Sparkles size={13} />}>
                  Oluştur
                </Button>
                <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>İptal</Button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} className="h-[160px]" />)}
        </div>
      )}

      {/* Error */}
      {queryError && !loading && (
        <ErrorState message={queryError.message} onRetry={() => refetch()} />
      )}

      {/* Empty state */}
      {!loading && !queryError && pets.length === 0 && !addOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <Card variant="raised" padding="lg" className="text-center">
            <div className="relative mx-auto mb-6 w-fit" style={{ animation: "float-soft 4s ease-in-out infinite" }}>
              <AurionView mood="NEUTRAL" level={1} color="#26A6A0" size={100} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">İlk Aurion'una hayat ver</h2>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-7 max-w-sm mx-auto leading-relaxed">
              Bir isim seç — Aurion seni tanıdıkça evrim geçirecek, duygularına göre değişecek.
            </p>
            <Button onClick={() => setAddOpen(true)} leftIcon={<Plus size={14} />}>
              Aurion Oluştur
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Pet grid */}
      {!loading && pets.length > 0 && (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {pets.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.38 }}
              >
                <Spotlight className="rounded-[var(--radius-xl)]" color={`${pet.colorTheme}22`} size={500}>
                  <Card
                    variant="raised"
                    padding="md"
                    className="group cursor-default"
                  >
                    <div className="flex items-center gap-6">
                      <div className="shrink-0">
                        <PetAvatar mood={pet.currentMood} level={pet.level} color={pet.colorTheme} size={110} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0 flex-1">
                            {renamingPetId === pet.id ? (
                              <form
                                onSubmit={(e) => { e.preventDefault(); handleRename(pet); }}
                                className="flex items-center gap-1.5"
                              >
                                <div className="flex-1 min-w-0">
                                  <Input
                                    value={renameDraft}
                                    onChange={(e) => setRenameDraft(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Escape") cancelRename(); }}
                                    maxLength={20}
                                    autoFocus
                                    aria-label="Yeni Aurion adı"
                                    className="w-full py-1.5 text-sm"
                                  />
                                </div>
                                <button type="submit" disabled={renaming} aria-label="Kaydet" className="shrink-0 rounded-lg p-1.5 text-[var(--color-success)] hover:bg-[var(--color-surface-glass)] transition-colors disabled:opacity-40 disabled:pointer-events-none">
                                  <Check size={16} />
                                </button>
                                <button type="button" onClick={cancelRename} disabled={renaming} aria-label="Vazgeç" className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-glass)] transition-colors disabled:opacity-40 disabled:pointer-events-none">
                                  <X size={16} />
                                </button>
                              </form>
                            ) : (
                              <>
                                <h3 className="text-lg font-bold tracking-tight text-[var(--color-text-primary)] truncate">{pet.name}</h3>
                                <p className="text-[11px] text-[var(--color-text-tertiary)] mt-0.5 flex items-center gap-1.5">
                                  <span className="inline-block h-1 w-1 rounded-full" style={{ background: pet.colorTheme }} />
                                  {FORM_NAMES[Math.min(pet.level, 5)] ?? "Nova"} formu
                                </p>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Level badge */}
                            <div
                              className="flex flex-col items-center px-3 py-1.5 rounded-xl"
                              style={{
                                background: `${pet.colorTheme}1a`,
                                border: `1px solid ${pet.colorTheme}33`,
                              }}
                            >
                              <span className="text-[8px] uppercase tracking-widest text-[var(--color-text-tertiary)] leading-none mb-0.5">Seviye</span>
                              <span className="text-[20px] font-bold leading-none tabular-nums" style={{ color: pet.colorTheme }}>{pet.level}</span>
                            </div>

                            {/* Options menu */}
                            <div className="relative shrink-0">
                              <button
                                onClick={() => toggleMenu(pet.id)}
                                className={cn(
                                  "rounded-lg p-1.5 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-glass)] transition-opacity duration-[var(--duration-fast)]",
                                  menuPetId === pet.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                                )}
                                aria-label="Pet seçenekleri"
                                aria-haspopup="menu"
                                aria-expanded={menuPetId === pet.id}
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              <AnimatePresence>
                                {menuPetId === pet.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={closeMenu} aria-hidden />
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                                      className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-overlay)] p-1 [box-shadow:var(--shadow-popover)]"
                                      role="menu"
                                    >
                                      {!confirmDelete ? (
                                        <>
                                          <button
                                            role="menuitem"
                                            onClick={() => startRename(pet)}
                                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-glass)] hover:text-[var(--color-text-primary)] transition-colors"
                                          >
                                            <Pencil size={14} /> Yeniden Adlandır
                                          </button>
                                          <button
                                            role="menuitem"
                                            onClick={() => setConfirmDelete(true)}
                                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors"
                                          >
                                            <Trash2 size={14} /> Serbest Bırak
                                          </button>
                                        </>
                                      ) : (
                                        <div className="px-2 py-1.5">
                                          <p className="mb-2.5 text-[12px] leading-snug text-[var(--color-text-secondary)]">
                                            <span className="font-semibold text-[var(--color-text-primary)]">{pet.name}</span> serbest bırakılsın mı? Bu işlem geri alınamaz.
                                          </p>
                                          <div className="flex gap-1.5">
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(pet)} className="flex-1">Evet, bırak</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Vazgeç</Button>
                                          </div>
                                        </div>
                                      )}
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>

                        <div className="mb-2"><MoodChip mood={pet.currentMood} size="sm" /></div>
                        <XpBar xp={pet.xp} level={pet.level} color={pet.colorTheme} />
                      </div>
                    </div>
                  </Card>
                </Spotlight>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

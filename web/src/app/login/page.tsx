"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import { CREATE_USER } from "@/graphql/operations";
import { setUserId } from "@/lib/session";
import { useToast } from "@/components/ui/Toast";
import AuroraBackground from "@/components/ui/AuroraBackground";
import GlassCard from "@/components/ui/GlassCard";
import FloatingInput from "@/components/ui/FloatingInput";
import AurionSpark from "@/components/aurion/AurionSpark";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [createUser, { loading }] = useMutation(CREATE_USER);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;
    try {
      const { data } = await createUser({
        variables: { username: username.trim(), email: email.trim() },
      });
      setUserId(data.createUser.id);
      router.push("/dashboard");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Bir hata oluştu", "error");
    }
  }

  return (
    <AuroraBackground mood="NEUTRAL">
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #7C5CFF, #9B59B6)" }}
            >
              <AurionSpark color="white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-aura-text leading-none">AuraPet</h1>
              <p className="text-xs text-aura-muted mt-0.5">Hesap oluştur veya giriş yap</p>
            </div>
          </div>

          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-aura-text mb-5">
              Kullanıcı bilgilerini gir
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FloatingInput
                label="Kullanıcı Adı"
                value={username}
                onChange={setUsername}
                required
                placeholder="örn. mavi_kedi"
              />
              <FloatingInput
                label="E-posta"
                value={email}
                onChange={setEmail}
                type="email"
                required
                placeholder="örn. mavi@kedi.com"
              />

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #7C5CFF, #9B59B6)",
                  boxShadow: "0 4px 20px rgba(124,92,255,0.3)",
                }}
              >
                {loading ? "Oluşturuluyor..." : "Başla"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </main>
    </AuroraBackground>
  );
}

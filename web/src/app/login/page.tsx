"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "@/graphql/operations";
import { setUserId } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [createUser, { loading, error }] = useMutation(CREATE_USER);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;
    const { data } = await createUser({
      variables: { username: username.trim(), email: email.trim() },
    });
    setUserId(data.createUser.id);
    router.push("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-1 text-aura-accent">AuraPet</h1>
        <p className="text-aura-muted text-sm mb-8">
          Devam etmek için kullanıcı bilgilerini gir.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-aura-muted font-medium uppercase tracking-widest">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="örn. mavi_kedi"
              required
              className="rounded-lg px-4 py-3 bg-aura-panel border border-aura-border text-aura-text placeholder-aura-muted focus:outline-none focus:border-aura-accent transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-aura-muted font-medium uppercase tracking-widest">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="örn. mavi@kedi.com"
              required
              className="rounded-lg px-4 py-3 bg-aura-panel border border-aura-border text-aura-text placeholder-aura-muted focus:outline-none focus:border-aura-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm rounded-lg bg-red-400/10 px-3 py-2">
              {error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-3 rounded-xl bg-aura-accent text-white font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
          >
            {loading ? "Oluşturuluyor..." : "Başla"}
          </button>
        </form>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Sparkles, Eye, EyeOff } from "lucide-react";
import { CREATE_USER, LOGIN } from "@/graphql/operations";
import { setUserId, setUsername as persistUsername } from "@/lib/session";
import { useToast } from "@/components/ui/Toast";
import GridPattern from "@/components/ui/GridPattern";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { cn } from "@/lib/cn";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<Mode>("signup");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"username" | "email" | "password", string>>>({});

  const [createUser, { loading: creating }] = useMutation(CREATE_USER);
  const [login, { loading: loggingIn }] = useMutation(LOGIN);
  const loading = creating || loggingIn;

  function switchMode(m: Mode) {
    setMode(m);
    setErrors({});
    // Mod değişiminde hassas alanları temizle (gizlilik + temiz başlangıç).
    setEmail("");
    setPassword("");
  }

  function validate() {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Kullanıcı adı gerekli";
    else if (username.length < 2) e.username = "En az 2 karakter olmalı";
    // E-posta ve şifre yalnızca kayıt olurken zorunludur; girişte kullanıcı
    // adına göre var olan hesap bulunur.
    if (mode === "signup") {
      if (!email.trim()) e.email = "E-posta gerekli";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Geçerli bir e-posta gir";
      if (!password.trim()) e.password = "Şifre gerekli";
      else if (password.length < 6) e.password = "En az 6 karakter olmalı";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (mode === "signup") {
        const { data } = await createUser({
          variables: { username: username.trim(), email: email.trim() },
        });
        setUserId(data.createUser.id);
        persistUsername(data.createUser.username);
      } else {
        const { data } = await login({
          variables: { username: username.trim() },
        });
        setUserId(data.login.id);
        persistUsername(data.login.username);
      }
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Bir hata oluştu";
      const lower = msg.toLowerCase();
      if (mode === "login" && (lower.includes("bulunamadı") || lower.includes("not_found"))) {
        setErrors((p) => ({ ...p, username: "Hesap bulunamadı. Önce kayıt ol." }));
      } else if (lower.includes("username") || lower.includes("kullanıcı adı")) {
        setErrors((p) => ({ ...p, username: "Bu kullanıcı adı alınmış" }));
      } else if (lower.includes("email") || lower.includes("e-posta")) {
        setErrors((p) => ({ ...p, email: "Bu e-posta zaten kayıtlı" }));
      } else {
        showToast(msg, "error");
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden flex" style={{ background: "var(--background)" }}>
      <GridPattern size={48} opacity={0.04} fadeEdges />
      <NoiseOverlay opacity={0.04} />

      <div className="relative z-10 w-full flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-5 max-w-6xl w-full mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
            <ArrowLeft size={14} />
            Ana sayfa
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: "var(--color-brand-400)" }}>
              <Sparkles size={14} className="text-white" strokeWidth={2.4} />
            </div>
            <span className="font-bold text-[14px] text-[var(--color-text-primary)]">AuraPet</span>
          </div>
        </header>

        {/* Centered card */}
        <div className="flex-1 flex items-center justify-center px-6 pb-10">
          <div className="enter w-full max-w-[420px]">
            {/* Title */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-[11px] bg-[var(--color-brand-soft)] border border-[rgba(38,166,160,0.28)] text-[var(--color-brand-200)]">
                <span className="inline-block h-1 w-1 rounded-full bg-[var(--color-brand-400)]" />
                <span className="font-semibold tracking-wide uppercase">Hoş Geldin</span>
              </div>
              <h1 className="font-display text-[30px] tracking-tight leading-tight mb-2 text-[var(--color-text-primary)]">
                <em className="italic text-[var(--color-brand-400)]">Aurion&apos;una</em>{" "}
                başla
              </h1>
              <p className="text-[13px] text-[var(--color-text-tertiary)] max-w-xs mx-auto leading-relaxed">
                {mode === "signup"
                  ? "Birkaç saniye içinde hesabını oluştur ve ilk Aurion'unu keşfet."
                  : "Kullanıcı adınla giriş yap — Aurion'ların ve günlüklerin seni bekliyor."}
              </p>
            </div>

            {/* Mode tabs */}
            <div className="flex rounded-xl bg-[var(--color-surface-glass)] border border-[var(--color-border-faint)] p-1 mb-5">
              {(["signup", "login"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    // cursor-pointer + touch-manipulation: iOS standalone PWA'da Safari,
                    // React'in kök seviyede delege ettiği click olayını cursor:pointer
                    // olmayan butonlara güvenilmez iletir → sekme "tıklanmıyor" görünür.
                    // Bu üçlü, dokunuşun handler'a ulaşmasını garantiler (tap gecikmesi + seçim engeli dahil).
                    "flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-[var(--duration-fast)]",
                    "cursor-pointer touch-manipulation select-none",
                    mode === m
                      ? "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-sm"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
                  )}
                >
                  {m === "signup" ? "Hesap Oluştur" : "Giriş Yap"}
                </button>
              ))}
            </div>

            {/* Card */}
            <div className="relative">
              <Card variant="elevated" padding="lg" className="relative">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative" noValidate>
                  <Input
                    label="Kullanıcı Adı"
                    floating
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: undefined })); }}
                    autoComplete="username"
                    errorText={errors.username}
                  />
                  {mode === "signup" && (
                    <Input
                      label="E-posta"
                      floating
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                      autoComplete="email"
                      errorText={errors.email}
                    />
                  )}
                  <Input
                    label="Şifre"
                    floating
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                    autoComplete="new-password"
                    errorText={errors.password}
                    rightIcon={
                      <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />

                  <Button type="submit" loading={loading} size="lg" className="mt-2" rightIcon={<ArrowRight size={15} />}>
                    {mode === "signup" ? "Aurion'u Aktive Et" : "Giriş Yap"}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Legal — bilgilendirme metni (web'de ayrı politika sayfası yok) */}
            <p className="text-center text-[11px] text-[var(--color-text-faint)] mt-5 leading-relaxed">
              Devam ederek{" "}
              <span className="text-[var(--color-text-tertiary)]">Kullanım Şartları</span>
              {" "}ve{" "}
              <span className="text-[var(--color-text-tertiary)]">Gizlilik</span>
              {" "}politikasını kabul etmiş olursun.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

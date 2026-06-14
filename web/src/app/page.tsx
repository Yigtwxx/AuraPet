"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Brain, Layers, BarChart3, ExternalLink } from "lucide-react";
import GridPattern from "@/components/ui/GridPattern";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AurionSpark from "@/components/aurion/AurionSpark";
import AurionGlimmer from "@/components/aurion/AurionGlimmer";
import ThemeToggle from "@/components/ui/ThemeToggle";

const FEATURES = [
  {
    icon: <Brain size={20} />,
    accent: "#26A6A0",
    title: "Türkçe Sentiment AI",
    body: "BERT tabanlı NLP modeli günlük yazını analiz ederek duygu sınıflarına ayırır.",
  },
  {
    icon: <Layers size={20} />,
    accent: "#26A6A0",
    title: "5 Aşamalı Evrim",
    body: "Aurion'un ruh haline göre rengi, halesi ve formu gerçek zamanlı değişir.",
  },
  {
    icon: <BarChart3 size={20} />,
    accent: "#26A6A0",
    title: "Trend Analitiği",
    body: "Zaman içindeki duygu eğilimlerini grafiklerle izle — kendini daha iyi tanı.",
  },
];

export default function SplashPage() {
  return (
    <main className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <GridPattern size={56} opacity={0.04} fadeEdges />
      <NoiseOverlay opacity={0.04} />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-20">
        {/* Top nav */}
        <nav className="flex items-center justify-between mb-20" aria-label="Ana navigasyon">
          <Link href="/" className="flex items-center gap-2.5" aria-label="AuraPet ana sayfa">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: "var(--color-brand-400)" }}>
              <Sparkles size={14} className="text-white" strokeWidth={2.4} aria-hidden />
            </div>
            <span className="font-display text-[17px] tracking-tight text-[var(--color-text-primary)]">AuraPet</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:flex" />
            <Link href="/login" className="hidden sm:inline-flex text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
              Giriş yap
            </Link>
            <Link href="/login">
              <Button size="sm" rightIcon={<ArrowRight size={13} />}>Başla</Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div
            className="enter inline-flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full text-[11.5px] bg-[var(--color-brand-soft)] border border-[rgba(38,166,160,0.28)] text-[var(--color-brand-200)]"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span className="font-semibold tracking-wide">Türkçe Sentiment Analizi</span>
            <span className="text-[var(--color-text-faint)]">·</span>
            <span>v2.0</span>
          </div>

          {/* Mascot */}
          <div className="enter relative inline-block mb-8">
            <div style={{ animation: "float-soft 5s ease-in-out infinite" }} className="relative">
              <AurionSpark color="#26A6A0" size={96} />
            </div>
          </div>

          {/* Headline — Instrument Serif for display */}
          <h1
            className="enter text-[clamp(2.4rem,6vw,4.2rem)] tracking-[-0.03em] leading-[1.04] mb-5"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="font-display text-[var(--color-text-primary)]">Duygularınla</span>
            <br />
            <span className="font-display italic text-[var(--color-brand-400)]">evrilen</span>{" "}
            <span className="font-bold text-[var(--color-text-primary)]">Aurion</span>
            <span className="text-[var(--color-brand-400)]">.</span>
          </h1>

          <p
            className="enter text-[16px] md:text-[17px] text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            Her gün nasıl hissettiğini yaz — dijital evcil hayvanın senin ruh haline göre renk, hale ve form değiştirir.
          </p>

          <div
            className="enter flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/login">
              <Button size="lg" rightIcon={<ArrowRight size={16} />}>Hemen Başla</Button>
            </Link>
            <Link href="https://github.com/Yigtwxx/AuraPet" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg" leftIcon={<ExternalLink size={15} />}>GitHub'da İncele</Button>
            </Link>
          </div>
        </section>

        {/* Dual Aurion showcase */}
        <div
          className="enter flex justify-center gap-8 mt-16 mb-16"
          style={{ animationDelay: "0.42s" }}
          aria-hidden
        >
          <div className="relative" style={{ animation: "float-soft 6s ease-in-out infinite" }}>
            <AurionSpark color="#FFD700" size={56} />
          </div>
          <div className="relative" style={{ animation: "float-soft 7s 1s ease-in-out infinite" }}>
            <AurionGlimmer color="#5B9BD5" size={56} />
          </div>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="enter" style={{ animationDelay: `${0.55 + i * 0.08}s` }}>
              <Card variant="raised" padding="md" className="h-full">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: `${f.accent}1c`, border: `1px solid ${f.accent}33`, color: f.accent }}>
                  {f.icon}
                </div>
                <h3 className="text-[14px] font-semibold text-[var(--color-text-primary)] mb-1.5">{f.title}</h3>
                <p className="text-[12.5px] text-[var(--color-text-tertiary)] leading-relaxed">{f.body}</p>
              </Card>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-[11px] text-[var(--color-text-faint)]">
          <p>Türkçe doğal dil işleme ile hayat bulan dijital bir deneyim.</p>
        </footer>
      </div>
    </main>
  );
}

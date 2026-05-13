import Link from "next/link";
import AuroraBackground from "@/components/ui/AuroraBackground";
import AurionSpark from "@/components/aurion/AurionSpark";

export default function SplashPage() {
  return (
    <AuroraBackground mood="NEUTRAL">
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Animated Aurion instead of emoji */}
        <div className="mb-8 relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(124,92,255,0.3) 0%, transparent 70%)",
              filter: "blur(20px)",
              transform: "scale(1.5)",
            }}
          />
          <AurionSpark color="#7C5CFF" size={80} />
        </div>

        <h1
          className="text-6xl font-bold mb-4 tracking-tight"
          style={{
            background: "linear-gradient(135deg, #E8EAED 30%, #7C5CFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AuraPet
        </h1>

        <p className="text-aura-muted text-lg mb-2 max-w-md leading-relaxed">
          Duygularınla evrilen dijital evcil hayvanın.
        </p>
        <p className="text-aura-muted/70 text-sm mb-10 max-w-sm">
          Her gün nasıl hissettiğini yaz — petın senin ruh haline göre değişir.
        </p>

        <Link
          href="/login"
          className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-semibold text-base text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #7C5CFF, #9B59B6)",
            boxShadow: "0 8px 32px rgba(124,92,255,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <span
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{ boxShadow: "0 0 40px rgba(124,92,255,0.6)" }}
          />
          Başla
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>

        <p className="mt-8 text-aura-muted/60 text-xs">
          Hesabın var mı?{" "}
          <Link href="/login" className="text-aura-accent underline underline-offset-4 hover:text-aura-accent/80 transition-colors">
            Giriş yap
          </Link>
        </p>
      </main>
    </AuroraBackground>
  );
}

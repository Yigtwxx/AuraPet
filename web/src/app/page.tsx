import Link from "next/link";

export default function SplashPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="mb-8 text-7xl select-none">🐾</div>
      <h1 className="text-5xl font-bold text-aura-accent mb-3 tracking-tight">
        AuraPet
      </h1>
      <p className="text-aura-muted text-lg mb-2 max-w-md">
        Duygularınla evrilen dijital evcil hayvanın.
      </p>
      <p className="text-aura-muted text-sm mb-10 max-w-sm">
        Her gün nasıl hissettiğini yaz — petın senin ruh haline göre değişir.
      </p>
      <Link
        href="/login"
        className="px-8 py-3 rounded-xl bg-aura-accent text-white font-semibold text-base hover:opacity-90 active:scale-95 transition-all"
      >
        Başla
      </Link>
      <p className="mt-6 text-aura-muted text-xs">
        Hesabın var mı?{" "}
        <Link
          href="/login"
          className="text-aura-accent underline underline-offset-2"
        >
          Giriş yap
        </Link>
      </p>
    </main>
  );
}

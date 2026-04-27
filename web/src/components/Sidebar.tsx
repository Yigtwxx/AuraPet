"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearUserId } from "@/lib/session";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/log", label: "Günlük Ekle", icon: "✍️" },
  { href: "/history", label: "Geçmiş", icon: "📜" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearUserId();
    router.push("/");
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-aura-panel border-r border-aura-border min-h-screen py-8 px-4">
      <div className="mb-8 px-2">
        <span className="text-aura-accent font-bold text-xl tracking-tight">
          🐾 AuraPet
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-aura-accent/20 text-aura-accent"
                  : "text-aura-muted hover:bg-aura-border hover:text-aura-text"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-aura-muted hover:bg-red-500/10 hover:text-red-400 transition-colors mt-4"
      >
        <span>🚪</span>
        Çıkış
      </button>
    </aside>
  );
}

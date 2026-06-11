"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { clearUserId, getUserId } from "@/lib/session";
import { LayoutDashboard, PenLine, ScrollText, LogOut, Sparkles, Command } from "lucide-react";
import ThemeToggle from "./ui/ThemeToggle";
import { useCommandPalette } from "./ui/CommandPalette";
import CommandPalette from "./ui/CommandPalette";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/dashboard", label: "Koleksiyon", icon: LayoutDashboard, ariaLabel: "Koleksiyona git" },
  { href: "/log",       label: "Günlük",     icon: PenLine,        ariaLabel: "Günlük ekle" },
  { href: "/history",   label: "Geçmiş",     icon: ScrollText,     ariaLabel: "Geçmişi görüntüle" },
];

function BrandMark() {
  return (
    <div className="mb-8 px-2 flex items-center gap-3">
      <div className="relative">
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #7C5CFF 0%, #8B7FFF 50%, #6644E8 100%)",
            boxShadow: "0 6px 20px -4px rgba(124,92,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <Sparkles size={14} className="text-white relative z-10" strokeWidth={2.4} />
          <span aria-hidden className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.45), transparent 55%)" }} />
        </div>
        <span aria-hidden className="absolute -inset-1 rounded-xl opacity-50 [filter:blur(8px)]" style={{ background: "radial-gradient(circle, rgba(139,127,255,0.5), transparent 70%)", animation: "pulse-glow 3.6s ease-in-out infinite" }} />
      </div>
      <p className="font-bold text-[15px] tracking-tight gradient-text leading-none">AuraPet</p>
    </div>
  );
}

function NavContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen, close } = useCommandPalette();
  const userId = getUserId();

  function handleLogout() {
    clearUserId();
    router.push("/");
  }

  return (
    <>
      <BrandMark />

      <p className="px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-faint)] mb-1.5">
        Menü
      </p>

      <nav className="flex flex-col gap-0.5 flex-1" aria-label="Ana navigasyon">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              aria-label={item.ariaLabel}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors duration-[var(--duration-fast)]",
                active ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]",
              )}
            >
              {active && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,92,255,0.2) 0%, rgba(155,89,182,0.08) 100%)",
                    border: "1px solid rgba(139,127,255,0.28)",
                    boxShadow: "0 8px 24px -10px rgba(124,92,255,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
              {!active && (
                <span aria-hidden className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)]" style={{ background: "rgba(255,255,255,0.03)" }} />
              )}
              <Icon
                size={16}
                className="relative z-10 shrink-0"
                style={{ color: active ? "var(--color-brand-400)" : undefined }}
                strokeWidth={active ? 2.2 : 1.8}
                aria-hidden
              />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ⌘K shortcut hint */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Komut paleti (⌘K)"
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-xl mb-3 text-[12px]",
          "text-[var(--color-text-faint)] hover:text-[var(--color-text-tertiary)]",
          "border border-[var(--color-border-faint)] hover:border-[var(--color-border-subtle)]",
          "transition-colors duration-[var(--duration-fast)]",
          "hover:bg-[var(--color-surface-glass)]",
        )}
      >
        <Command size={13} aria-hidden />
        <span className="flex-1 text-left">Ara…</span>
        <kbd className="font-mono text-[10px] opacity-50">⌘K</kbd>
      </button>

      <CommandPalette open={open} onClose={close} />

      <div className="border-t border-[var(--color-border-faint)] pt-4 space-y-3">
        <ThemeToggle className="w-full justify-center" />

        {userId && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-surface-glass)] border border-[var(--color-border-faint)]">
            <div className="h-6 w-6 rounded-full bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
              <span className="text-[10px] font-semibold text-[var(--color-brand-400)]">A</span>
            </div>
            <span className="flex-1 text-[11px] text-[var(--color-text-tertiary)] truncate">Hesabın</span>
            <button
              onClick={handleLogout}
              aria-label="Çıkış yap"
              className="shrink-0 rounded-lg p-1 text-[var(--color-text-faint)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors duration-[var(--duration-fast)]"
            >
              <LogOut size={13} aria-hidden />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Sidebar({ drawerOpen = false, onClose }: { drawerOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      <aside
        className="hidden md:flex w-[240px] shrink-0 flex-col min-h-screen py-7 px-3 relative"
        style={{
          background: "linear-gradient(180deg, rgba(13,15,22,0.65) 0%, rgba(7,8,12,0.9) 100%)",
          borderRight: "1px solid var(--color-border-faint)",
          backdropFilter: "blur(24px) saturate(1.4)",
        }}
      >
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-10 h-48 w-48 rounded-full opacity-20 [filter:blur(60px)]" style={{ background: "#7C5CFF" }} />
        <div className="relative flex flex-col flex-1">
          <NavContent />
        </div>
      </aside>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="md:hidden fixed left-0 top-0 h-full w-[240px] z-50 flex flex-col py-7 px-3"
              style={{ background: "rgba(11,13,20,0.97)", borderRight: "1px solid var(--color-border-subtle)", backdropFilter: "blur(28px)" }}
              aria-label="Navigasyon menüsü"
            >
              <NavContent onNavClick={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, History, Sun, Moon, Monitor, LogOut, Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/cn";
import { clearUserId } from "@/lib/session";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  const navigate = useCallback((path: string) => {
    router.push(path);
    onClose();
  }, [router, onClose]);

  const setThemeAndClose = useCallback((t: string) => {
    setTheme(t);
    onClose();
  }, [setTheme, onClose]);

  const handleLogout = useCallback(() => {
    clearUserId();
    router.push("/login");
    onClose();
  }, [router, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <Command
              className={cn(
                "rounded-xl border border-[var(--color-border-strong)]",
                "bg-[var(--color-surface-elevated)]",
                "[box-shadow:var(--shadow-popover)]",
                "overflow-hidden",
              )}
              shouldFilter
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-subtle)]">
                <Search className="h-4 w-4 text-[var(--color-text-tertiary)] shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Sayfaya git, tema değiştir…"
                  className={cn(
                    "flex-1 bg-transparent text-sm text-[var(--color-text-primary)]",
                    "placeholder:text-[var(--color-text-faint)]",
                    "outline-none",
                  )}
                />
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-[var(--color-border-subtle)] bg-[var(--color-surface-glass)] px-1.5 text-[10px] font-medium text-[var(--color-text-tertiary)]">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-72 overflow-y-auto py-2">
                <Command.Empty className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                  Sonuç bulunamadı.
                </Command.Empty>

                <CommandGroup heading="Sayfalar">
                  <CommandItem icon={<LayoutDashboard className="h-4 w-4" />} label="Koleksiyon" onSelect={() => navigate("/dashboard")} />
                  <CommandItem icon={<BookOpen className="h-4 w-4" />} label="Yeni Günlük" onSelect={() => navigate("/log")} />
                  <CommandItem icon={<History className="h-4 w-4" />} label="Geçmiş" onSelect={() => navigate("/history")} />
                </CommandGroup>

                <CommandGroup heading="Tema">
                  <CommandItem icon={<Sun className="h-4 w-4" />} label="Açık mod" onSelect={() => setThemeAndClose("light")} />
                  <CommandItem icon={<Moon className="h-4 w-4" />} label="Koyu mod" onSelect={() => setThemeAndClose("dark")} />
                  <CommandItem icon={<Monitor className="h-4 w-4" />} label="Sistem tercihi" onSelect={() => setThemeAndClose("system")} />
                </CommandGroup>

                <CommandGroup heading="Hesap">
                  <CommandItem icon={<LogOut className="h-4 w-4" />} label="Çıkış yap" onSelect={handleLogout} variant="danger" />
                </CommandGroup>
              </Command.List>

              <div className="flex items-center gap-4 border-t border-[var(--color-border-subtle)] px-4 py-2.5 text-[10px] text-[var(--color-text-faint)]">
                <span className="font-medium">AuraPet</span>
                <span className="ml-auto flex gap-3">
                  <span><kbd className="font-mono">↑↓</kbd> Gezin</span>
                  <span><kbd className="font-mono">↵</kbd> Seç</span>
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-[var(--color-text-faint)]"
    >
      {children}
    </Command.Group>
  );
}

function CommandItem({
  icon,
  label,
  onSelect,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  onSelect: () => void;
  variant?: "danger";
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
        "transition-colors duration-100",
        "data-[selected=true]:bg-[var(--color-surface-glass-strong)]",
        "outline-none",
        variant === "danger"
          ? "text-[var(--color-danger)] data-[selected=true]:bg-[var(--color-danger-soft)]"
          : "text-[var(--color-text-primary)]",
      )}
    >
      <span className={cn("shrink-0 opacity-60", variant === "danger" && "opacity-80")}>{icon}</span>
      {label}
    </Command.Item>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen, close: () => setOpen(false) };
}

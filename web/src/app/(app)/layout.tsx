"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import GridPattern from "@/components/ui/GridPattern";
import NoiseOverlay from "@/components/ui/NoiseOverlay";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <GridPattern size={48} opacity={0.025} fadeEdges />
      <NoiseOverlay opacity={0.03} />

      <div className="relative z-10 flex w-full min-h-screen">
        <Sidebar drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar */}
          <header
            className="md:hidden flex items-center justify-between gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] shrink-0 sticky top-0 z-20"
            style={{ background: "var(--color-surface-canvas)", borderBottom: "1px solid var(--color-border-subtle)" }}
          >
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-glass)] transition-colors"
              aria-label="Menüyü aç"
            >
              <Menu size={18} aria-hidden />
            </button>
            <span className="font-display text-[17px] text-[var(--color-text-primary)]">AuraPet</span>
            <ThemeToggle />
          </header>

          <main className="flex-1 px-5 pt-6 md:px-10 md:pt-10 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] md:pb-[calc(env(safe-area-inset-bottom,0px)+2.5rem)] overflow-y-auto" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

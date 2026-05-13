"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--background)" }}
    >
      <Sidebar drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile top bar */}
        <header
          className="md:hidden flex items-center gap-3 px-4 py-3 shrink-0 sticky top-0 z-20"
          style={{
            background: "rgba(10,11,15,0.8)",
            borderBottom: "1px solid var(--color-border-subtle)",
            backdropFilter: "blur(16px)",
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-lg text-aura-muted hover:text-aura-text hover:bg-white/5 transition-colors"
            aria-label="Menüyü aç"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
              <rect y="9" width="14" height="2" rx="1" fill="currentColor" />
              <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
          <span
            className="font-bold text-base"
            style={{
              background: "linear-gradient(135deg, #E8EAED 30%, #7C5CFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AuraPet
          </span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

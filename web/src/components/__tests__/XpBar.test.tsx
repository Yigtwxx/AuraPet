import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import XpBar from "../XpBar";

// framer-motion'ı mock'la (jsdom'da animasyon yok)
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, style, className }: React.HTMLAttributes<HTMLDivElement>) => (
      <div style={style} className={className}>{children}</div>
    ),
  },
}));

describe("XpBar", () => {
  it("XP değerini gösterir", () => {
    render(<XpBar xp={150} level={2} color="#FFD700" />);
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("Sonraki seviye eşiğini gösterir (level 2 → 250 XP)", () => {
    render(<XpBar xp={150} level={2} color="#FFD700" />);
    expect(screen.getByText("250")).toBeInTheDocument();
  });

  it("Maks seviyede 'Maks Seviye!' gösterir", () => {
    render(<XpBar xp={900} level={5} color="#9B59B6" />);
    expect(screen.getByText("Maks Seviye!")).toBeInTheDocument();
  });

  it("Level 1'den 2'ye geçiş eşiği 100 XP", () => {
    render(<XpBar xp={50} level={1} color="#95A5A6" />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});

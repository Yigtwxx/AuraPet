import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AurionView from "../aurion/AurionView";

vi.mock("framer-motion", () => {
  const m = ({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...rest}>{children}</div>
  );
  return {
    motion: { div: m },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useReducedMotion: () => false,
  };
});

describe("AurionView — form by level", () => {
  it("level 1 → aurion-spark", () => {
    render(<AurionView mood="NEUTRAL" level={1} color="#95A5A6" />);
    expect(screen.getByTestId("aurion-spark")).toBeInTheDocument();
  });

  it("level 2 → aurion-drift", () => {
    render(<AurionView mood="NEUTRAL" level={2} color="#95A5A6" />);
    expect(screen.getByTestId("aurion-drift")).toBeInTheDocument();
  });

  it("level 3 → aurion-glimmer", () => {
    render(<AurionView mood="NEUTRAL" level={3} color="#95A5A6" />);
    expect(screen.getByTestId("aurion-glimmer")).toBeInTheDocument();
  });

  it("level 4 → aurion-aether", () => {
    render(<AurionView mood="NEUTRAL" level={4} color="#95A5A6" />);
    expect(screen.getByTestId("aurion-aether")).toBeInTheDocument();
  });

  it("level 5 → aurion-nova", () => {
    render(<AurionView mood="HAPPY" level={5} color="#FFD700" />);
    expect(screen.getByTestId("aurion-nova")).toBeInTheDocument();
  });

  it("level 0 (alt sınır) → aurion-spark", () => {
    render(<AurionView mood="NEUTRAL" level={0} color="#95A5A6" />);
    expect(screen.getByTestId("aurion-spark")).toBeInTheDocument();
  });

  it("level 99 (üst sınır) → aurion-nova", () => {
    render(<AurionView mood="HAPPY" level={99} color="#FFD700" />);
    expect(screen.getByTestId("aurion-nova")).toBeInTheDocument();
  });
});

describe("AurionView — color prop SVG'ye iletiliyor", () => {
  it("HAPPY rengi (#FFD700) SVG path fill'ine yansır", () => {
    render(<AurionView mood="HAPPY" level={1} color="#FFD700" />);
    const svg = screen.getByTestId("aurion-spark");
    const paths = svg.querySelectorAll("path, ellipse, circle");
    const fillsColor = Array.from(paths).some(
      (el) => el.getAttribute("fill") === "#FFD700"
    );
    expect(fillsColor).toBe(true);
  });

  it("ANXIOUS rengi (#9B59B6) SVG'ye iletiliyor", () => {
    render(<AurionView mood="ANXIOUS" level={5} color="#9B59B6" />);
    const svg = screen.getByTestId("aurion-nova");
    const paths = svg.querySelectorAll("path, ellipse, circle");
    const fillsColor = Array.from(paths).some(
      (el) => el.getAttribute("fill") === "#9B59B6"
    );
    expect(fillsColor).toBe(true);
  });
});

describe("PetAvatar regression — level prop iletilmesi", () => {
  it("PetAvatar level=3 ile doğru form render eder", async () => {
    const { default: PetAvatar } = await import("../PetAvatar");
    render(<PetAvatar mood="NEUTRAL" level={3} color="#95A5A6" size={120} />);
    expect(screen.getByTestId("aurion-glimmer")).toBeInTheDocument();
  });
});

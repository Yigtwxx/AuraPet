import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockSetTheme = vi.fn();
let mockTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: mockTheme, setTheme: mockSetTheme }),
}));

vi.mock("lucide-react", () => ({
  Sun:     ({ className }: { className?: string }) => <svg data-testid="sun-icon"     className={className} />,
  Moon:    ({ className }: { className?: string }) => <svg data-testid="moon-icon"    className={className} />,
  Monitor: ({ className }: { className?: string }) => <svg data-testid="monitor-icon" className={className} />,
}));

import ThemeToggle from "../ui/ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "dark";
  });

  it("renders all three theme buttons", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Açık" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sistem" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Koyu" })).toBeInTheDocument();
  });

  it("marks active theme with aria-pressed=true", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Koyu" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Açık" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Sistem" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls setTheme with 'light' when Açık is clicked", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Açık" }));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("calls setTheme with 'system' when Sistem is clicked", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Sistem" }));
    expect(mockSetTheme).toHaveBeenCalledWith("system");
  });

  it("calls setTheme with 'dark' when Koyu is clicked", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Koyu" }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("has aria-label='Tema seçici' on group", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("group", { name: "Tema seçici" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ThemeToggle className="extra-cls" />);
    expect(screen.getByRole("group").className).toContain("extra-cls");
  });
});

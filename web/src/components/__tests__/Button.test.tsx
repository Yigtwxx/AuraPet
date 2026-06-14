import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Gönder</Button>);
    expect(screen.getByRole("button", { name: "Gönder" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Tıkla</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Devre Dışı</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled and shows spinner when loading", () => {
    render(<Button loading>Yükleniyor</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("does not call onClick when disabled", () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Tıkla</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handler).not.toHaveBeenCalled();
  });

  it("renders leftIcon before children", () => {
    render(<Button leftIcon={<span data-testid="icon-left" />}>Metin</Button>);
    expect(screen.getByTestId("icon-left")).toBeInTheDocument();
    expect(screen.getByText("Metin")).toBeInTheDocument();
  });

  it("renders rightIcon after children", () => {
    render(<Button rightIcon={<span data-testid="icon-right" />}>Metin</Button>);
    expect(screen.getByTestId("icon-right")).toBeInTheDocument();
  });

  it("applies variant classes via CVA", () => {
    render(<Button variant="danger">Sil</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/danger/i);
  });

  it("applies size='sm' class", () => {
    render(<Button size="sm">Küçük</Button>);
    expect(screen.getByRole("button").className).toMatch(/h-8/);
  });

  it("merges custom className", () => {
    render(<Button className="extra-class">Test</Button>);
    expect(screen.getByRole("button").className).toContain("extra-class");
  });

  it("forwards ref to underlying button", () => {
    const ref = { current: null };
    render(<Button ref={ref}>Ref Test</Button>);
    expect(ref.current).not.toBeNull();
  });
});

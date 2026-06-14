import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "../ui/EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="Henüz kayıt yok" />);
    expect(screen.getByText("Henüz kayıt yok")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="Başlık" description="Açıklama metni" />);
    expect(screen.getByText("Açıklama metni")).toBeInTheDocument();
  });

  it("does not render description element when omitted", () => {
    render(<EmptyState title="Başlık" />);
    expect(screen.queryByText("Açıklama metni")).not.toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(<EmptyState title="T" icon={<span data-testid="empty-icon" />} />);
    expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
  });

  it("does not render icon slot when omitted", () => {
    render(<EmptyState title="T" />);
    expect(screen.queryByTestId("empty-icon")).not.toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <EmptyState
        title="T"
        action={<button>Ekle</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Ekle" })).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<EmptyState title="T" className="custom-cls" />);
    expect(container.firstChild).toHaveClass("custom-cls");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorState from "../ui/ErrorState";

vi.mock("lucide-react", () => ({
  AlertCircle: () => <svg data-testid="alert-icon" />,
}));

describe("ErrorState", () => {
  it("renders default error message", () => {
    render(<ErrorState />);
    expect(screen.getByText("Bir şeyler ters gitti.")).toBeInTheDocument();
  });

  it("renders custom error message", () => {
    render(<ErrorState message="Bağlantı hatası." />);
    expect(screen.getByText("Bağlantı hatası.")).toBeInTheDocument();
  });

  it("renders alert icon", () => {
    render(<ErrorState />);
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(<ErrorState />);
    expect(screen.queryByRole("button", { name: /tekrar dene/i })).not.toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    render(<ErrorState onRetry={() => {}} />);
    expect(screen.getByRole("button", { name: /tekrar dene/i })).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: /tekrar dene/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("applies custom className", () => {
    const { container } = render(<ErrorState className="custom-cls" />);
    expect(container.firstChild).toHaveClass("custom-cls");
  });
});

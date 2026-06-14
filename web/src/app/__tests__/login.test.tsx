import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { CREATE_USER, LOGIN } from "@/graphql/operations";

// ── Navigation ─────────────────────────────────────────────────────────────
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}));

// ── Session ────────────────────────────────────────────────────────────────
const mockSetUserId = vi.fn();
const mockSetUsername = vi.fn();
vi.mock("@/lib/session", () => ({
  setUserId: (id: string) => mockSetUserId(id),
  setUsername: (name: string) => mockSetUsername(name),
}));

// ── Toast ──────────────────────────────────────────────────────────────────
const mockShowToast = vi.fn();
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

// ── Decorative / heavy visuals ───────────────────────────────────────────────
vi.mock("@/components/ui/GridPattern", () => ({ default: () => <div /> }));
vi.mock("@/components/ui/NoiseOverlay", () => ({ default: () => <div /> }));
vi.mock("@/components/ui/Card", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("lucide-react", () => ({
  ArrowRight: () => <svg />,
  ArrowLeft: () => <svg />,
  Sparkles: () => <svg />,
  Eye: () => <svg />,
  EyeOff: () => <svg />,
}));

// Functional minimal Input/Button so we can drive the form.
vi.mock("@/components/ui/Input", () => ({
  default: ({ label, value, onChange, errorText, type }: {
    label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorText?: string; type?: string;
  }) => (
    <div>
      <input aria-label={label} type={type ?? "text"} value={value} onChange={onChange} />
      {errorText ? <span role="alert">{errorText}</span> : null}
    </div>
  ),
}));
vi.mock("@/components/ui/Button", () => ({
  default: ({ children, type, onClick, disabled }: {
    children: React.ReactNode;
    type?: "submit" | "reset" | "button";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }) => <button type={type} onClick={onClick} disabled={disabled}>{children}</button>,
}));

import LoginPage from "../login/page";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

function renderWith(mocks: readonly object[]) {
  return render(
    <MockedProvider mocks={mocks as never[]}>
      <LoginPage />
    </MockedProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("starts in signup mode showing the email field", () => {
    renderWith([]);
    expect(screen.getByLabelText("E-posta")).toBeInTheDocument();
  });

  it("hides the email field when switching to login mode", () => {
    renderWith([]);
    fireEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
    expect(screen.queryByLabelText("E-posta")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Kullanıcı Adı")).toBeInTheDocument();
  });

  it("clears email and password when switching modes (privacy)", () => {
    renderWith([]);
    fireEvent.change(screen.getByLabelText("E-posta"), { target: { value: "x@y.com" } });
    fireEvent.change(screen.getByLabelText("Şifre"), { target: { value: "secret123" } });

    // signup → login: şifre temizlenmeli, e-posta gizlenmeli
    fireEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
    expect(screen.getByLabelText("Şifre")).toHaveValue("");

    // login → signup: e-posta yeniden görünür ve boş olmalı
    fireEvent.click(screen.getByRole("button", { name: "Hesap Oluştur" }));
    expect(screen.getByLabelText("E-posta")).toHaveValue("");
  });

  it("persists the username on successful signup", async () => {
    const mocks = [{
      request: { query: CREATE_USER, variables: { username: "yeni", email: "yeni@aura.pet" } },
      result: { data: { createUser: { id: "u-new", username: "yeni", email: "yeni@aura.pet" } } },
    }];
    const { container } = renderWith(mocks);

    fireEvent.change(screen.getByLabelText("Kullanıcı Adı"), { target: { value: "yeni" } });
    fireEvent.change(screen.getByLabelText("E-posta"), { target: { value: "yeni@aura.pet" } });
    fireEvent.change(screen.getByLabelText("Şifre"), { target: { value: "secret123" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(mockSetUsername).toHaveBeenCalledWith("yeni"));
  });

  it("signs up a new user and stores the returned id", async () => {
    const mocks = [{
      request: { query: CREATE_USER, variables: { username: "yeni", email: "yeni@aura.pet" } },
      result: { data: { createUser: { id: "u-new", username: "yeni", email: "yeni@aura.pet" } } },
    }];
    const { container } = renderWith(mocks);

    fireEvent.change(screen.getByLabelText("Kullanıcı Adı"), { target: { value: "yeni" } });
    fireEvent.change(screen.getByLabelText("E-posta"), { target: { value: "yeni@aura.pet" } });
    fireEvent.change(screen.getByLabelText("Şifre"), { target: { value: "secret123" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(mockSetUserId).toHaveBeenCalledWith("u-new"));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("logs in an existing user by username and shares the same id", async () => {
    const mocks = [{
      request: { query: LOGIN, variables: { username: "demo" } },
      result: { data: { login: { id: "u-shared", username: "demo", email: "demo@aura.pet" } } },
    }];
    const { container } = renderWith(mocks);

    fireEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
    fireEvent.change(screen.getByLabelText("Kullanıcı Adı"), { target: { value: "demo" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(mockSetUserId).toHaveBeenCalledWith("u-shared"));
    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("shows an account-not-found error when login fails", async () => {
    const mocks = [{
      request: { query: LOGIN, variables: { username: "ghost" } },
      error: new Error("Hesap bulunamadı. Önce kayıt olun."),
    }];
    const { container } = renderWith(mocks);

    fireEvent.click(screen.getByRole("button", { name: "Giriş Yap" }));
    fireEvent.change(screen.getByLabelText("Kullanıcı Adı"), { target: { value: "ghost" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => expect(screen.getByText(/Hesap bulunamadı/i)).toBeInTheDocument());
    expect(mockSetUserId).not.toHaveBeenCalled();
  });
});

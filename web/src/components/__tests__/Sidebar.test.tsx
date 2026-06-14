import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/dashboard");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    aside: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <aside {...props}>{children}</aside>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/session", () => ({
  clearUserId: vi.fn(),
  getUserId: vi.fn(() => null),
  getUsername: vi.fn(() => null),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "dark", setTheme: vi.fn(), resolvedTheme: "dark" }),
}));

vi.mock("@/components/ui/CommandPalette", () => ({
  useCommandPalette: () => ({ open: false, setOpen: vi.fn(), close: vi.fn() }),
  default: () => null,
}));

import Sidebar from "../Sidebar";
import { clearUserId, getUserId } from "@/lib/session";

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AuraPet logosunu gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByText(/AuraPet/i)).toBeInTheDocument();
  });

  it("3 nav öğesini listeler", () => {
    render(<Sidebar />);
    expect(screen.getByText("Koleksiyon")).toBeInTheDocument();
    expect(screen.getByText("Günlük")).toBeInTheDocument();
    expect(screen.getByText("Geçmiş")).toBeInTheDocument();
  });

  it("⌘K search butonunu gösterir", () => {
    render(<Sidebar />);
    expect(screen.getByRole("button", { name: /Komut paleti/i })).toBeInTheDocument();
  });

  it("Dashboard linki aktif olduğunda aria-current='page' alır", () => {
    render(<Sidebar />);
    const link = screen.getByRole("link", { name: /Koleksiyona git/i });
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("Kullanıcı giriş yapmamışsa çıkış butonu görünmez", () => {
    render(<Sidebar />);
    expect(screen.queryByRole("button", { name: /Çıkış yap/i })).not.toBeInTheDocument();
  });
});

describe("Sidebar — logged in user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockReturnValue("user-123");
  });

  it("Giriş yapıldığında çıkış butonu görünür", () => {
    render(<Sidebar />);
    expect(screen.getByRole("button", { name: /Çıkış yap/i })).toBeInTheDocument();
  });

  it("Çıkış butonuna tıklayınca clearUserId ve /login'e yönlendirme çağrılır", () => {
    render(<Sidebar />);
    fireEvent.click(screen.getByRole("button", { name: /Çıkış yap/i }));
    expect(clearUserId).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/login");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { GET_LOGS } from "@/graphql/operations";

// ── Navigation ─────────────────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter:   () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/history",
}));

// ── Auth ───────────────────────────────────────────────────────────────────
vi.mock("@/lib/session", () => ({
  getUserId:   vi.fn(() => "user-123"),
  clearUserId: vi.fn(),
}));

// ── Toast ──────────────────────────────────────────────────────────────────
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

// ── Visual / heavy components ──────────────────────────────────────────────
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});
vi.mock("@/components/MoodChart", () => ({
  default: () => <div data-testid="mood-chart" />,
}));
vi.mock("@/components/ui/SectionHeading", () => ({
  default: ({ title }: { title: string }) => <h1>{title}</h1>,
}));
vi.mock("@/components/ui/Card", () => ({
  default: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
}));
vi.mock("@/components/ui/Skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => <div data-testid="skeleton" className={className} />,
}));
vi.mock("@/components/ui/EmptyState", () => ({
  default: ({ description }: { description?: string }) => <div data-testid="empty-state">{description}</div>,
}));
vi.mock("@/components/ui/AnimatedNumber", () => ({
  default: ({ value }: { value: number }) => <span data-testid="animated-number">{value}</span>,
}));
vi.mock("lucide-react", () => ({
  BarChart2:   () => <svg />,
  TrendingUp:  () => <svg />,
  Flame:       () => <svg />,
  FileText:    () => <svg />,
  PenLine:     () => <svg />,
  Calendar:    () => <svg />,
  Smile:       () => <svg />,
  ChevronDown: () => <svg />,
  ChevronUp:   () => <svg />,
  AlertCircle: () => <svg />,
}));

import HistoryPage from "../(app)/history/page";

const LOG = {
  id: "log-1",
  entryText: "Harika bir gündü.",
  sentimentScore: 0.85,
  createdAt: new Date().toISOString(),
};

describe("HistoryPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows skeletons while loading", () => {
    render(
      <MockedProvider mocks={[]}>
        <HistoryPage />
      </MockedProvider>,
    );
    expect(screen.getAllByTestId("skeleton").length).toBeGreaterThan(0);
  });

  it("renders log entries after data loads", async () => {
    const mocks = [{
      request: { query: GET_LOGS, variables: { userId: "user-123" } },
      result:  { data: { getLogs: [LOG] } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <HistoryPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Harika bir gündü.")).toBeInTheDocument();
    });
  });

  it("renders KPI section heading", async () => {
    const mocks = [{
      request: { query: GET_LOGS, variables: { userId: "user-123" } },
      result:  { data: { getLogs: [LOG] } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <HistoryPage />
      </MockedProvider>,
    );

    await waitFor(() => screen.getByText("Harika bir gündü."));
    expect(screen.getByRole("heading", { name: /Duygu Geçmişin/i })).toBeInTheDocument();
  });

  it("shows empty state when no logs exist", async () => {
    const mocks = [{
      request: { query: GET_LOGS, variables: { userId: "user-123" } },
      result:  { data: { getLogs: [] } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <HistoryPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  it("does not show empty state when logs exist", async () => {
    const mocks = [{
      request: { query: GET_LOGS, variables: { userId: "user-123" } },
      result:  { data: { getLogs: [LOG] } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <HistoryPage />
      </MockedProvider>,
    );

    await waitFor(() => screen.getByText("Harika bir gündü."));
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });

  it("shows an error state with retry when the query fails", async () => {
    const mocks = [{
      request: { query: GET_LOGS, variables: { userId: "user-123" } },
      error:   new Error("Ağ hatası"),
    }];

    render(
      <MockedProvider mocks={mocks}>
        <HistoryPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Tekrar dene/i })).toBeInTheDocument();
    });
    // Hata durumunda boş durum gösterilmemeli (sessiz "kayıt yok" yanıltıcı olurdu).
    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });
});

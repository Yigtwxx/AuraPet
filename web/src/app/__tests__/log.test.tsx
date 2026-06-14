import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { ADD_LOG_ENTRY } from "@/graphql/operations";

// ── Navigation ─────────────────────────────────────────────────────────────
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter:   () => ({ replace: mockReplace, push: vi.fn() }),
  usePathname: () => "/log",
}));

// ── Auth ───────────────────────────────────────────────────────────────────
vi.mock("@/lib/session", () => ({
  getUserId:   vi.fn(() => "user-123"),
  clearUserId: vi.fn(),
}));

// ── Toast ──────────────────────────────────────────────────────────────────
const mockShowToast = vi.fn();
vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

// ── Visual components ──────────────────────────────────────────────────────
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
vi.mock("@/components/PetAvatar",       () => ({ default: ({ name }: { name: string }) => <div data-testid="pet-avatar">{name}</div> }));
vi.mock("@/components/XpBar",           () => ({ default: () => <div data-testid="xp-bar" /> }));
vi.mock("@/components/ui/MoodLottie",   () => ({ default: ({ mood }: { mood: string }) => <div data-testid="mood-lottie">{mood}</div> }));
vi.mock("@/components/ui/SentimentChip", () => ({ default: ({ label }: { label: string }) => <span data-testid="sentiment-chip">{label}</span> }));
vi.mock("@/components/ui/SectionHeading", () => ({ default: ({ title }: { title: string }) => <h1>{title}</h1> }));
vi.mock("@/components/ui/AnimatedNumber", () => ({ default: ({ value }: { value: number }) => <span>{value}</span> }));
vi.mock("@/components/ui/Card", () => ({
  default: ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
}));
vi.mock("lucide-react", () => ({
  Sparkles: () => <svg />,
  Wand2:    () => <svg />,
  Sun:      () => <svg />,
  Cloud:    () => <svg />,
  Wind:     () => <svg />,
  AlertCircle: () => <svg />,
}));

import LogPage from "../(app)/log/page";

const LOG_RESULT = {
  sentimentLabel: "POSITIVE",
  sentimentScore: 0.85,
  pet: { name: "Kıvılcım", level: 2, xp: 200, currentMood: "HAPPY", colorTheme: "#FFD700" },
};

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

describe("LogPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it("renders the textarea", () => {
    render(
      <MockedProvider mocks={[]}>
        <LogPage />
      </MockedProvider>,
    );
    expect(screen.getByRole("textbox", { name: /Günlük metni/i })).toBeInTheDocument();
  });

  it("renders the submit button", () => {
    render(
      <MockedProvider mocks={[]}>
        <LogPage />
      </MockedProvider>,
    );
    expect(screen.getByRole("button", { name: /Gönder/i })).toBeInTheDocument();
  });

  it("shows suggestion chips", () => {
    render(
      <MockedProvider mocks={[]}>
        <LogPage />
      </MockedProvider>,
    );
    expect(screen.getByRole("button", { name: /Öneri.*enerjik/i })).toBeInTheDocument();
  });

  it("fills textarea when suggestion chip is clicked", () => {
    render(
      <MockedProvider mocks={[]}>
        <LogPage />
      </MockedProvider>,
    );
    const suggBtn = screen.getByRole("button", { name: /Öneri.*enerjik/i });
    fireEvent.click(suggBtn);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toMatch(/enerjik/i);
  });

  it("shows analysis result after successful submission", async () => {
    const mocks = [{
      request: { query: ADD_LOG_ENTRY, variables: { userId: "user-123", entryText: "Harika bir gün!" } },
      result: { data: { addLogEntry: LOG_RESULT } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <LogPage />
      </MockedProvider>,
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Harika bir gün!" } });
    fireEvent.submit(textarea.closest("form")!);

    await waitFor(() => {
      expect(screen.getByTestId("sentiment-chip")).toBeInTheDocument();
    });
    expect(screen.getByTestId("pet-avatar")).toBeInTheDocument();
  });

  it("clears textarea after successful submission", async () => {
    const mocks = [{
      request: { query: ADD_LOG_ENTRY, variables: { userId: "user-123", entryText: "Harika bir gün!" } },
      result: { data: { addLogEntry: LOG_RESULT } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <LogPage />
      </MockedProvider>,
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Harika bir gün!" } });
    fireEvent.submit(textarea.closest("form")!);

    await waitFor(() => expect(screen.getByTestId("sentiment-chip")).toBeInTheDocument());
    expect(textarea.value).toBe("");
  });

  it("shows error toast on mutation error", async () => {
    const mocks = [{
      request: { query: ADD_LOG_ENTRY, variables: { userId: "user-123", entryText: "Hatalı." } },
      error: new Error("AI servisi mevcut değil"),
    }];

    render(
      <MockedProvider mocks={mocks}>
        <LogPage />
      </MockedProvider>,
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hatalı." } });
    fireEvent.submit(textarea.closest("form")!);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), "error");
    });
  });

  it("does not submit when textarea is empty", () => {
    const mocks = [{
      request: { query: ADD_LOG_ENTRY, variables: { userId: "user-123", entryText: "" } },
      result: { data: { addLogEntry: LOG_RESULT } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <LogPage />
      </MockedProvider>,
    );

    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(mockShowToast).not.toHaveBeenCalled();
  });

  it("restores draft from localStorage on mount", () => {
    localStorageMock.setItem("aurapet_log_draft", "Taslak metin");

    render(
      <MockedProvider mocks={[]}>
        <LogPage />
      </MockedProvider>,
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Taslak metin");
  });
});

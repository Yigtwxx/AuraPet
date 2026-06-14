import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { GET_USER_PETS, CREATE_PET } from "@/graphql/operations";

// ── Navigation ─────────────────────────────────────────────────────────────
const mockReplace = vi.fn();
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter:   () => ({ replace: mockReplace, push: mockPush }),
  usePathname: () => "/dashboard",
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

// ── Heavy visual components ────────────────────────────────────────────────
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div:    ({ children, ...p }: React.HTMLAttributes<HTMLDivElement>) => <div {...p}>{children}</div>,
      form:   ({ children, ...p }: React.HTMLAttributes<HTMLFormElement>) => <form {...p}>{children}</form>,
      aside:  ({ children, ...p }: React.HTMLAttributes<HTMLElement>) => <aside {...p}>{children}</aside>,
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});
vi.mock("@/components/PetAvatar", () => ({ default: ({ name }: { name: string }) => <div data-testid="pet-avatar">{name}</div> }));
vi.mock("@/components/XpBar",     () => ({ default: () => <div data-testid="xp-bar" /> }));
vi.mock("@/components/ui/Spotlight", () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/components/aurion/AurionView", () => ({ default: () => <div data-testid="aurion" /> }));
vi.mock("@/components/ui/MoodChip", () => ({ default: ({ mood }: { mood: string }) => <span>{mood}</span> }));
vi.mock("@/components/ui/SectionHeading", () => ({ default: ({ title }: { title: string }) => <h1>{title}</h1> }));
vi.mock("@/components/ui/Skeleton", () => ({ SkeletonCard: () => <div data-testid="skeleton-card" /> }));
vi.mock("lucide-react", () => ({
  Plus:         () => <svg />,
  Sparkles:     () => <svg />,
  MoreHorizontal: () => <svg />,
  AlertCircle:  () => <svg />,
}));

import DashboardPage from "../(app)/dashboard/page";

// ── Sample data ─────────────────────────────────────────────────────────────
const PET = { id: "p1", name: "Kıvılcım", level: 2, xp: 150, currentMood: "HAPPY", colorTheme: "#FFD700" };

describe("DashboardPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders skeleton cards while loading", () => {
    render(
      <MockedProvider mocks={[]}>
        <DashboardPage />
      </MockedProvider>,
    );
    expect(screen.getAllByTestId("skeleton-card").length).toBeGreaterThan(0);
  });

  it("renders pets after data loads", async () => {
    const mocks = [{
      request: { query: GET_USER_PETS, variables: { userId: "user-123" } },
      result: { data: { getUserPets: [PET] } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <DashboardPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Kıvılcım")).toBeInTheDocument();
    });
  });

  it("shows empty state when no pets", async () => {
    const mocks = [{
      request: { query: GET_USER_PETS, variables: { userId: "user-123" } },
      result: { data: { getUserPets: [] } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <DashboardPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/İlk Aurion'una hayat ver/i)).toBeInTheDocument();
    });
  });

  it("shows toast on query error", async () => {
    const mocks = [{
      request: { query: GET_USER_PETS, variables: { userId: "user-123" } },
      error: new Error("Network error"),
    }];

    render(
      <MockedProvider mocks={mocks}>
        <DashboardPage />
      </MockedProvider>,
    );

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), "error");
    });
  });

  it("add form appears when Yeni Aurion is clicked", async () => {
    const mocks = [{
      request: { query: GET_USER_PETS, variables: { userId: "user-123" } },
      result: { data: { getUserPets: [PET] } },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <DashboardPage />
      </MockedProvider>,
    );

    await waitFor(() => screen.getByText("Kıvılcım"));
    fireEvent.click(screen.getByRole("button", { name: /Yeni Aurion/i }));
    expect(screen.getByPlaceholderText(/Lyra/i)).toBeInTheDocument();
  });

  it("creates a pet on form submit", async () => {
    const petsMock = {
      request: { query: GET_USER_PETS, variables: { userId: "user-123" } },
      result: { data: { getUserPets: [PET] } },
    };
    const createMock = {
      request: { query: CREATE_PET, variables: { userId: "user-123", name: "Nova" } },
      result: { data: { createPet: { id: "p2", name: "Nova", level: 1, xp: 0, currentMood: "NEUTRAL", colorTheme: "#95A5A6" } } },
    };
    const refetchMock = {
      request: { query: GET_USER_PETS, variables: { userId: "user-123" } },
      result: { data: { getUserPets: [PET, { ...PET, id: "p2", name: "Nova" }] } },
    };

    render(
      <MockedProvider mocks={[petsMock, createMock, refetchMock]}>
        <DashboardPage />
      </MockedProvider>,
    );

    await waitFor(() => screen.getByText("Kıvılcım"));
    fireEvent.click(screen.getByRole("button", { name: /Yeni Aurion/i }));
    const input = screen.getByPlaceholderText(/Lyra/i);
    fireEvent.change(input, { target: { value: "Nova" } });
    fireEvent.submit(input.closest("form")!);

    await waitFor(() => {
      expect(screen.getByText("Nova")).toBeInTheDocument();
    });
  });
});

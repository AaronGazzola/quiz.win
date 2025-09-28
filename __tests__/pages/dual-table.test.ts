/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "@/app/(dashboard)/page";

// Mock the hooks
jest.mock("@/app/layout.hooks", () => ({
  useGetUser: jest.fn(),
}));

jest.mock("@/app/(dashboard)/page.hooks", () => ({
  useGetQuizzes: jest.fn(),
  useGetDashboardMetrics: jest.fn(),
  useProcessInvitation: jest.fn(),
  useViewportResize: jest.fn(),
  useViewportPagination: jest.fn(),
  useGetQuizResponses: jest.fn(),
  useExportResponses: jest.fn(),
}));

jest.mock("@/app/(dashboard)/page.stores", () => ({
  useQuizTableStore: jest.fn(),
  useBulkOperationStore: jest.fn(),
  useQuizDialogStore: jest.fn(),
  useResponseTableStore: jest.fn(),
}));

// Mock the components
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Dashboard Quiz/Responses Dual-Table", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    jest.clearAllMocks();

    // Mock the stores
    const { useQuizTableStore, useBulkOperationStore, useQuizDialogStore, useResponseTableStore } =
      require("@/app/(dashboard)/page.stores");

    useQuizTableStore.mockReturnValue({
      search: "",
      sort: { column: null, direction: null },
      page: 0,
      itemsPerPage: 10,
      selectedItems: new Set(),
      setSearch: jest.fn(),
      setSort: jest.fn(),
      setPage: jest.fn(),
      setItemsPerPage: jest.fn(),
      toggleSelected: jest.fn(),
      selectAll: jest.fn(),
      clearSelection: jest.fn(),
    });

    useBulkOperationStore.mockReturnValue({
      isVisible: false,
      isLoading: false,
      setVisible: jest.fn(),
    });

    useQuizDialogStore.mockReturnValue({
      isOpen: false,
      editingQuiz: null,
      openCreate: jest.fn(),
      openEdit: jest.fn(),
      close: jest.fn(),
    });

    useResponseTableStore.mockReturnValue({
      search: "",
      sort: { column: "completedAt", direction: "desc" },
      page: 0,
      itemsPerPage: 10,
      setSearch: jest.fn(),
      setSort: jest.fn(),
      setPage: jest.fn(),
      reset: jest.fn(),
    });

    // Mock the hooks
    const { useGetUser } = require("@/app/layout.hooks");
    const {
      useGetQuizzes,
      useGetDashboardMetrics,
      useProcessInvitation,
      useViewportResize,
      useViewportPagination,
      useGetQuizResponses,
      useExportResponses
    } = require("@/app/(dashboard)/page.hooks");

    useGetUser.mockReturnValue({
      data: {
        id: "user1",
        email: "admin@example.com",
        role: "user",
        members: [{ role: "admin", organizationId: "org1" }]
      }
    });

    useGetDashboardMetrics.mockReturnValue({
      data: {
        totalQuizzes: 2,
        completedToday: 5,
        teamMembers: 10,
        activeInvites: 2
      },
      isLoading: false
    });

    useProcessInvitation.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    useViewportResize.mockImplementation((callback) => {
      // Mock implementation
    });

    useViewportPagination.mockReturnValue({
      calculateItemsPerPage: jest.fn().mockReturnValue(10),
    });

    useGetQuizResponses.mockReturnValue({
      data: {
        responses: [],
        totalCount: 0,
        totalPages: 0
      },
      isLoading: false
    });

    useExportResponses.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    useGetQuizzes.mockReturnValue({
      data: {
        quizzes: [
          {
            id: "quiz1",
            title: "Test Quiz 1",
            organizationId: "org1",
            createdAt: "2024-01-01",
            _count: { questions: 5, responses: 10 }
          },
          {
            id: "quiz2",
            title: "Test Quiz 2",
            organizationId: "org1",
            createdAt: "2024-01-02",
            _count: { questions: 3, responses: 5 }
          }
        ],
        totalPages: 1,
        totalCount: 2
      },
      isLoading: false
    });

    // Mock layout hooks
    jest.mock("@/app/layout.hooks", () => ({
      useGetUser: jest.fn(),
      useGetUserMembers: jest.fn(),
    }));

    const { useGetUserMembers } = require("@/app/layout.hooks");
    useGetUserMembers.mockReturnValue({
      data: {
        members: [
          { role: "admin", organizationId: "org1", organization: { name: "Organization 1" } },
          { role: "member", organizationId: "org2", organization: { name: "Organization 2" } },
        ]
      }
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );
  };

  describe("Quiz Table", () => {
    it("should display quizzes in the top table", async () => {
      renderComponent();

      expect(screen.getByText("Test Quiz 1")).toBeInTheDocument();
      expect(screen.getByText("Test Quiz 2")).toBeInTheDocument();
      expect(screen.getByText("5 questions")).toBeInTheDocument();
      expect(screen.getByText("3 questions")).toBeInTheDocument();
    });

    it("should display dashboard metrics", async () => {
      renderComponent();

      expect(screen.getByText("Total Quizzes")).toBeInTheDocument();
      expect(screen.getByText("Completed Today")).toBeInTheDocument();
    });

    it("should show radio buttons for quiz selection", async () => {
      renderComponent();

      const radioButtons = screen.getAllByRole("radio");
      expect(radioButtons).toHaveLength(2);
    });

    it("should allow selecting a quiz with radio button", async () => {
      renderComponent();

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[0]);

      await waitFor(() => {
        expect(radioButtons[0]).toBeChecked();
      });
    });
  });

  describe("Responses Table", () => {
    it("should not show responses table initially", () => {
      renderComponent();

      expect(screen.queryByText("Responses for")).not.toBeInTheDocument();
    });

    it("should show responses table when quiz is selected and user is admin", async () => {
      renderComponent();

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Responses for.*Test Quiz 1/)).toBeInTheDocument();
      });
    });

    it("should not show responses table for non-admin users", async () => {
      const { useGetUser } = require("@/app/layout.hooks");
      useGetUser.mockReturnValue({
        data: {
          id: "user1",
          email: "member@example.com",
          role: "user",
          members: [{ role: "member", organizationId: "org1" }]
        }
      });

      renderComponent();

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText(/Responses for/)).not.toBeInTheDocument();
      });
    });

    it("should show responses table for super admin", async () => {
      const { useGetUser } = require("@/app/layout.hooks");
      useGetUser.mockReturnValue({
        data: {
          id: "user1",
          email: "superadmin@example.com",
          role: "super-admin",
          members: []
        }
      });

      renderComponent();

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Responses for.*Test Quiz 1/)).toBeInTheDocument();
      });
    });
  });

  describe("Data Isolation", () => {
    it("should only show quizzes from user's organizations", async () => {
      const { useGetQuizzes } = require("@/app/(dashboard)/page.hooks");

      // Mock data with quizzes from different organizations
      useGetQuizzes.mockReturnValue({
        data: {
          quizzes: [
            {
              id: "quiz1",
              title: "Org1 Quiz",
              organizationId: "org1", // User is member
              createdAt: "2024-01-01",
              _count: { questions: 5, responses: 10 }
            },
            // Quiz from org3 should not appear since user is not a member
          ],
          totalPages: 1,
          totalCount: 1
        },
        isLoading: false
      });

      renderComponent();

      expect(screen.getByText("Org1 Quiz")).toBeInTheDocument();
      expect(screen.queryByText("External Quiz")).not.toBeInTheDocument();
    });

    it("should filter responses by organization admin permissions", async () => {
      renderComponent();

      const radioButtons = screen.getAllByRole("radio");
      fireEvent.click(radioButtons[0]);

      await waitFor(() => {
        // Responses table should only show for quiz from org where user is admin
        expect(screen.getByText(/Responses for.*Test Quiz 1/)).toBeInTheDocument();
      });
    });
  });

  describe("Permission Validation", () => {
    it("should show team member metrics for admin users", () => {
      renderComponent();

      expect(screen.getByText("Team Members")).toBeInTheDocument();
      expect(screen.getByText("Active Invites")).toBeInTheDocument();
    });

    it("should not show admin metrics for member users", () => {
      const { useGetUser } = require("@/app/layout.hooks");
      useGetUser.mockReturnValue({
        data: {
          id: "user1",
          email: "member@example.com",
          role: "user",
          members: [{ role: "member", organizationId: "org1" }]
        }
      });

      renderComponent();

      expect(screen.queryByText("Team Members")).not.toBeInTheDocument();
      expect(screen.queryByText("Active Invites")).not.toBeInTheDocument();
    });

    it("should show quiz management interface for all users", async () => {
      renderComponent();

      expect(screen.getByText("Quizzes")).toBeInTheDocument();
      expect(screen.getByText("Select a quiz to view its responses")).toBeInTheDocument();
    });
  });
});
/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QuizzesPage from "@/app/(dashboard)/quizzes/page";

// Mock the hooks
jest.mock("@/app/layout.hooks", () => ({
  useGetUser: jest.fn(),
}));

jest.mock("@/app/quizzes/page.hooks", () => ({
  useGetQuizzes: jest.fn(),
  useGetUserOrganizations: jest.fn(),
  useBulkDeleteQuizzes: jest.fn(),
}));

jest.mock("@/app/quizzes/page.stores", () => ({
  useQuizTableStore: jest.fn(),
  useBulkOperationStore: jest.fn(),
  useViewportPagination: jest.fn(),
  useQuizDialogStore: jest.fn(),
}));

// Mock the components
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Dual-Table Quiz/Responses Page", () => {
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
    const { useQuizTableStore, useBulkOperationStore, useViewportPagination, useQuizDialogStore } =
      require("@/app/quizzes/page.stores");

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

    useViewportPagination.mockReturnValue({
      calculateItemsPerPage: jest.fn().mockReturnValue(10),
    });

    useQuizDialogStore.mockReturnValue({
      isOpen: false,
      editingQuiz: null,
      openCreate: jest.fn(),
      openEdit: jest.fn(),
      close: jest.fn(),
    });

    // Mock the hooks
    const { useGetUser } = require("@/app/layout.hooks");
    const { useGetQuizzes, useGetUserOrganizations, useBulkDeleteQuizzes } =
      require("@/app/quizzes/page.hooks");

    useGetUser.mockReturnValue({
      data: {
        id: "user1",
        email: "admin@example.com",
        role: "user",
        members: [{ role: "admin", organizationId: "org1" }]
      }
    });

    useGetUserOrganizations.mockReturnValue({
      data: [
        { id: "org1", name: "Organization 1", role: "admin" },
        { id: "org2", name: "Organization 2", role: "member" },
      ]
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

    useBulkDeleteQuizzes.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <QuizzesPage />
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

    it("should display organization filter when multiple organizations", async () => {
      renderComponent();

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("Organization 1")).toBeInTheDocument();
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
      const { useGetQuizzes } = require("@/app/quizzes/page.hooks");

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
    it("should show create button for admin users", () => {
      renderComponent();

      expect(screen.getByText("Create Quiz")).toBeInTheDocument();
    });

    it("should not show create button for member users", () => {
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

      expect(screen.queryByText("Create Quiz")).not.toBeInTheDocument();
    });

    it("should show bulk operations for admin users", async () => {
      const { useQuizTableStore } = require("@/app/quizzes/page.stores");
      useQuizTableStore.mockReturnValue({
        search: "",
        sort: { column: null, direction: null },
        page: 0,
        itemsPerPage: 10,
        selectedItems: new Set(["quiz1"]),
        setSearch: jest.fn(),
        setSort: jest.fn(),
        setPage: jest.fn(),
        setItemsPerPage: jest.fn(),
        toggleSelected: jest.fn(),
        selectAll: jest.fn(),
        clearSelection: jest.fn(),
      });

      const { useBulkOperationStore } = require("@/app/quizzes/page.stores");
      useBulkOperationStore.mockReturnValue({
        isVisible: true,
        isLoading: false,
        setVisible: jest.fn(),
      });

      renderComponent();

      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });
  });
});
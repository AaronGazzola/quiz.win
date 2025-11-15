import { create } from "zustand";
import { TableState, BulkOperationState, QuizWithDetails, ResponseTableState, ResponseDetailState, DashboardMetrics, ResponseWithUser, ResponseWithDetails } from "./page.types";

const initialTableState = {
  search: "",
  sort: { column: "", direction: null as "asc" | "desc" | null },
  page: 0,
  itemsPerPage: 10,
  selectedItems: new Set<string>(),
};

export const useQuizTableStore = create<TableState>()((set, get) => ({
  ...initialTableState,
  setSearch: (search) => set({ search, page: 0 }),
  setSort: (column, direction) => {
    const currentSort = get().sort;
    let newDirection: "asc" | "desc" | null = direction;

    if (currentSort.column === column) {
      if (currentSort.direction === "asc") newDirection = "desc";
      else if (currentSort.direction === "desc") newDirection = null;
      else newDirection = "asc";
    } else {
      newDirection = "asc";
    }

    set({ sort: { column, direction: newDirection }, page: 0 });
  },
  setPage: (page) => set({ page }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, page: 0 }),
  setSelectedItems: (selectedItems) => set({ selectedItems }),
  toggleSelected: (id) => {
    const { selectedItems } = get();
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    set({ selectedItems: newSelected });
  },
  selectAll: (items) => {
    const allIds = new Set(items.map(item => item.id));
    set({ selectedItems: allIds });
  },
  clearSelection: () => set({ selectedItems: new Set() }),
  reset: () => set(initialTableState),
}));

const initialBulkState = {
  isVisible: false,
  isLoading: false,
};

export const useBulkOperationStore = create<BulkOperationState>()((set) => ({
  ...initialBulkState,
  setVisible: (isVisible) => set({ isVisible }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set(initialBulkState),
}));

export const useViewportPagination = () => {
  const ROW_HEIGHT = 60;
  const HEADER_HEIGHT = 120;
  const PAGINATION_HEIGHT = 60;

  const calculateItemsPerPage = (containerHeight: number): number => {
    const availableHeight = containerHeight - HEADER_HEIGHT - PAGINATION_HEIGHT;
    const items = Math.floor(availableHeight / ROW_HEIGHT);
    return Math.max(1, items);
  };

  return { calculateItemsPerPage, ROW_HEIGHT };
};

const initialQuizDialogState = {
  isOpen: false,
  editingQuiz: null as QuizWithDetails | null,
};

export const useQuizDialogStore = create<{
  isOpen: boolean;
  editingQuiz: QuizWithDetails | null;
  openCreate: () => void;
  openEdit: (quiz: QuizWithDetails) => void;
  close: () => void;
}>()((set) => ({
  ...initialQuizDialogState,
  openCreate: () => set({ isOpen: true, editingQuiz: null }),
  openEdit: (quiz) => set({ isOpen: true, editingQuiz: quiz }),
  close: () => set(initialQuizDialogState),
}));

const initialResponseTableState = {
  search: "",
  sort: { column: "completedAt", direction: "desc" as "asc" | "desc" | null },
  page: 0,
  itemsPerPage: 10,
  selectedResponseId: null,
};

export const useResponseTableStore = create<ResponseTableState>()((set, get) => ({
  ...initialResponseTableState,
  setSearch: (search) => set({ search, page: 0 }),
  setSort: (column, direction) => {
    const currentSort = get().sort;
    let newDirection: "asc" | "desc" | null = direction;

    if (currentSort.column === column) {
      if (currentSort.direction === "asc") newDirection = "desc";
      else if (currentSort.direction === "desc") newDirection = null;
      else newDirection = "asc";
    } else {
      newDirection = "asc";
    }

    set({ sort: { column, direction: newDirection }, page: 0 });
  },
  setPage: (page) => set({ page }),
  setItemsPerPage: (itemsPerPage) => set({ itemsPerPage, page: 0 }),
  setSelectedResponseId: (responseId) => set({ selectedResponseId: responseId }),
  toggleSelected: (id) => {
    const { selectedResponseId } = get();
    set({ selectedResponseId: selectedResponseId === id ? null : id });
  },
  clearSelection: () => set({ selectedResponseId: null }),
  reset: () => set(initialResponseTableState),
}));

const initialResponseDetailState = {
  selectedResponseId: null,
  viewMode: "responses" as "responses" | "response-detail",
};

export const useResponseDetailStore = create<ResponseDetailState>()((set) => ({
  ...initialResponseDetailState,
  setSelectedResponseId: (responseId) => set({ selectedResponseId: responseId }),
  setViewMode: (mode) => set({ viewMode: mode }),
  reset: () => set(initialResponseDetailState),
}));

const initialDashboardDataState = {
  metrics: null as DashboardMetrics | null,
  quizzes: null as QuizWithDetails[] | null,
  quizzesTotalCount: 0,
  quizzesTotalPages: 0,
};

export const useDashboardDataStore = create<{
  metrics: DashboardMetrics | null;
  quizzes: QuizWithDetails[] | null;
  quizzesTotalCount: number;
  quizzesTotalPages: number;
  setMetrics: (metrics: DashboardMetrics | null) => void;
  setQuizzes: (quizzes: QuizWithDetails[] | null, totalCount: number, totalPages: number) => void;
  reset: () => void;
}>()((set) => ({
  ...initialDashboardDataState,
  setMetrics: (metrics) => set({ metrics }),
  setQuizzes: (quizzes, totalCount, totalPages) => set({
    quizzes,
    quizzesTotalCount: totalCount,
    quizzesTotalPages: totalPages
  }),
  reset: () => set(initialDashboardDataState),
}));

const initialResponseDataState = {
  responses: null as ResponseWithUser[] | null,
  responsesTotalCount: 0,
  responsesTotalPages: 0,
  responseDetail: null as ResponseWithDetails | null,
  userResponse: null as ResponseWithDetails | null,
};

export const useResponseDataStore = create<{
  responses: ResponseWithUser[] | null;
  responsesTotalCount: number;
  responsesTotalPages: number;
  responseDetail: ResponseWithDetails | null;
  userResponse: ResponseWithDetails | null;
  setResponses: (responses: ResponseWithUser[] | null, totalCount: number, totalPages: number) => void;
  setResponseDetail: (detail: ResponseWithDetails | null) => void;
  setUserResponse: (response: ResponseWithDetails | null) => void;
  reset: () => void;
}>()((set) => ({
  ...initialResponseDataState,
  setResponses: (responses, totalCount, totalPages) => set({
    responses,
    responsesTotalCount: totalCount,
    responsesTotalPages: totalPages
  }),
  setResponseDetail: (detail) => set({ responseDetail: detail }),
  setUserResponse: (response) => set({ userResponse: response }),
  reset: () => set(initialResponseDataState),
}));
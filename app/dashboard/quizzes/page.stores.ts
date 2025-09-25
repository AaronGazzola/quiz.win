import { create } from "zustand";
import { TableState, BulkOperationState, QuizWithDetails } from "./page.types";

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
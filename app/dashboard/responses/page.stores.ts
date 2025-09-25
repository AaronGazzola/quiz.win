import { create } from "zustand";
import { ResponseTableState, ResponseWithDetails } from "./page.types";

const initialState = {
  search: "",
  sort: { column: "", direction: null as "asc" | "desc" | null },
  page: 0,
  itemsPerPage: 10,
  selectedItems: new Set<string>(),
};

export const useResponseTableStore = create<ResponseTableState>()((set, get) => ({
  ...initialState,

  setSearch: (search: string) => set({ search, page: 0 }),

  setSort: (column: string) => {
    const currentSort = get().sort;
    let newDirection: "asc" | "desc" | null;

    if (currentSort.column !== column) {
      newDirection = "asc";
    } else {
      switch (currentSort.direction) {
        case "asc":
          newDirection = "desc";
          break;
        case "desc":
          newDirection = null;
          break;
        default:
          newDirection = "asc";
      }
    }

    set({ sort: { column, direction: newDirection }, page: 0 });
  },

  setPage: (page: number) => set({ page }),
  setItemsPerPage: (itemsPerPage: number) => set({ itemsPerPage, page: 0 }),

  toggleSelected: (id: string) =>
    set((state) => {
      const newSelectedItems = new Set(state.selectedItems);
      if (newSelectedItems.has(id)) {
        newSelectedItems.delete(id);
      } else {
        newSelectedItems.add(id);
      }
      return { selectedItems: newSelectedItems };
    }),

  selectAll: (items: ResponseWithDetails[]) =>
    set({ selectedItems: new Set(items.map((item) => item.id)) }),

  clearSelection: () => set({ selectedItems: new Set() }),
}));

export const useBulkOperationStore = create<{
  isVisible: boolean;
  isLoading: boolean;
  setVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
}>()((set) => ({
  isVisible: false,
  isLoading: false,
  setVisible: (isVisible: boolean) => set({ isVisible }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
}));

export const useViewportPagination = () => {
  const ROW_HEIGHT = 60;
  const HEADER_HEIGHT = 120;
  const PAGINATION_HEIGHT = 60;

  const calculateItemsPerPage = (containerHeight: number) => {
    const availableHeight = containerHeight - HEADER_HEIGHT - PAGINATION_HEIGHT;
    return Math.max(5, Math.floor(availableHeight / ROW_HEIGHT));
  };

  return { calculateItemsPerPage };
};
import { create } from "zustand";
import { UserTableState, BulkOperationState, UserWithDetails } from "./page.types";

export const useUserTableStore = create<UserTableState>()((set, get) => ({
  search: "",
  sort: {
    column: "",
    direction: null,
  },
  page: 0,
  itemsPerPage: 10,
  selectedItems: new Set<string>(),

  setSearch: (search: string) => {
    set({ search, page: 0 });
  },

  setSort: (column: string, _direction: "asc" | "desc" | null) => {
    const currentSort = get().sort;

    if (currentSort.column === column) {
      if (currentSort.direction === "asc") {
        set({ sort: { column, direction: "desc" } });
      } else if (currentSort.direction === "desc") {
        set({ sort: { column: "", direction: null } });
      } else {
        set({ sort: { column, direction: "asc" } });
      }
    } else {
      set({ sort: { column, direction: "asc" } });
    }
  },

  setPage: (page: number) => {
    set({ page });
  },

  setItemsPerPage: (itemsPerPage: number) => {
    set({ itemsPerPage, page: 0 });
  },

  toggleSelected: (id: string) => {
    const selectedItems = new Set(get().selectedItems);
    if (selectedItems.has(id)) {
      selectedItems.delete(id);
    } else {
      selectedItems.add(id);
    }
    set({ selectedItems });
  },

  selectAll: (items: UserWithDetails[]) => {
    const selectedItems = new Set(items.map(item => item.id));
    set({ selectedItems });
  },

  clearSelection: () => {
    set({ selectedItems: new Set<string>() });
  },
}));

export const useBulkOperationStore = create<BulkOperationState>()((set) => ({
  isVisible: false,
  isLoading: false,

  setVisible: (visible: boolean) => {
    set({ isVisible: visible });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
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
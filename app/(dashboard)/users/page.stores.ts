import { create } from "zustand";
import { UserTableState, BulkOperationState, UserWithDetails, UserRoleManagementDialogState, ConfirmationDialogState, OrganizationRole } from "./page.types";

const initialUserTableState = {
  search: "",
  sort: {
    column: "",
    direction: null as "asc" | "desc" | null,
  },
  page: 0,
  itemsPerPage: 10,
  selectedItems: new Set<string>(),
};

export const useUserTableStore = create<UserTableState>()((set, get) => ({
  ...initialUserTableState,

  setSearch: (search: string) => {
    set({ search, page: 0 });
  },

  setSort: (column: string) => {
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

  reset: () => {
    set(initialUserTableState);
  },
}));

const initialBulkOperationState = {
  isVisible: false,
  isLoading: false,
};

export const useBulkOperationStore = create<BulkOperationState>()((set) => ({
  ...initialBulkOperationState,

  setVisible: (visible: boolean) => {
    set({ isVisible: visible });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set(initialBulkOperationState);
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

export const useUserRoleManagementDialogStore = create<UserRoleManagementDialogState>()((set, get) => ({
  isOpen: false,
  selectedUser: null,
  organizationRoles: [],

  openDialog: (user: UserWithDetails, sharedOrganizations: OrganizationRole[]) => {
    set({ isOpen: true, selectedUser: user, organizationRoles: sharedOrganizations });
  },

  closeDialog: () => {
    set({ isOpen: false, selectedUser: null, organizationRoles: [] });
  },

  updateRole: (organizationId: string, newRole: string) => {
    const roles = get().organizationRoles.map(role =>
      role.organizationId === organizationId ? { ...role, newRole } : role
    );
    set({ organizationRoles: roles });
  },

  resetRoles: () => {
    const roles = get().organizationRoles.map(role => ({ ...role, newRole: role.currentRole }));
    set({ organizationRoles: roles });
  },
}));

export const useConfirmationDialogStore = create<ConfirmationDialogState>()((set) => ({
  isOpen: false,
  type: null,
  title: "",
  message: "",
  banReason: "",
  onConfirm: null,

  openDialog: (type, title, message, onConfirm, banReason) => {
    set({ isOpen: true, type, title, message, onConfirm, banReason: banReason || "" });
  },

  closeDialog: () => {
    set({ isOpen: false, type: null, title: "", message: "", banReason: "", onConfirm: null });
  },

  setBanReason: (reason: string) => {
    set({ banReason: reason });
  },
}));
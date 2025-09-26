import { User, Member, Organization } from "@prisma/client";

export interface UserWithDetails extends User {
  members: (Member & {
    organization: Organization;
  })[];
  _count: {
    members: number;
  };
}

export interface UsersData {
  users: UserWithDetails[];
  totalPages: number;
  totalCount: number;
}

export interface UserTableState {
  search: string;
  sort: {
    column: string;
    direction: "asc" | "desc" | null;
  };
  page: number;
  itemsPerPage: number;
  selectedItems: Set<string>;
  setSearch: (search: string) => void;
  setSort: (column: string, direction: "asc" | "desc" | null) => void;
  setPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  toggleSelected: (id: string) => void;
  selectAll: (items: UserWithDetails[]) => void;
  clearSelection: () => void;
}

export interface BulkOperationState {
  isVisible: boolean;
  isLoading: boolean;
  setVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
}
import { User, Member, Organization } from "@prisma/client";

export interface UserWithDetails extends User {
  members: (Member & {
    organization: Organization;
  })[];
  _count: {
    members: number;
  };
  organizationName?: string;
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

export interface UserDetailDialogState {
  isOpen: boolean;
  selectedUser: UserWithDetails | null;
  openDialog: (user: UserWithDetails) => void;
  closeDialog: () => void;
}

export interface ConfirmationDialogState {
  isOpen: boolean;
  type: 'ban' | 'unban' | 'changeRole' | 'bulkBan' | 'bulkUnban' | 'bulkChangeRole' | null;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  openDialog: (type: ConfirmationDialogState['type'], title: string, message: string, onConfirm: () => void) => void;
  closeDialog: () => void;
}

export interface RoleAssignmentData {
  userId: string;
  organizationId: string;
  newRole: string;
}

export interface BulkRoleAssignmentData {
  userIds: string[];
  organizationId: string;
  newRole: string;
}

export interface BanUserData {
  userId: string;
  banReason?: string;
  banExpires?: Date;
}

export interface BulkBanData {
  userIds: string[];
  banReason?: string;
  banExpires?: Date;
}
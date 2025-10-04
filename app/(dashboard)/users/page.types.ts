import { user, member, organization } from "@prisma/client";

export interface UserWithDetails extends user {
  member: (member & {
    organization: organization;
  })[];
  _count: {
    member: number;
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

export interface OrganizationRole {
  organizationId: string;
  organizationName: string;
  currentRole: string;
  newRole: string;
}

export interface UserRoleManagementDialogState {
  isOpen: boolean;
  selectedUser: UserWithDetails | null;
  organizationRoles: OrganizationRole[];
  openDialog: (user: UserWithDetails, sharedOrganizations: OrganizationRole[]) => void;
  closeDialog: () => void;
  updateRole: (organizationId: string, newRole: string) => void;
  resetRoles: () => void;
}

export interface ConfirmationDialogState {
  isOpen: boolean;
  type: 'ban' | 'unban' | 'changeRole' | 'bulkBan' | 'bulkUnban' | 'bulkChangeRole' | 'saveRoles' | null;
  title: string;
  message: string;
  banReason?: string;
  onConfirm: (() => void) | null;
  openDialog: (type: ConfirmationDialogState['type'], title: string, message: string, onConfirm: () => void, banReason?: string) => void;
  closeDialog: () => void;
  setBanReason: (reason: string) => void;
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

export interface MultipleRoleAssignmentData {
  userId: string;
  roleChanges: {
    organizationId: string;
    newRole: string;
  }[];
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
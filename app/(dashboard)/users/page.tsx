"use client";

import { useGetUser, useGetUserMembers } from "@/app/layout.hooks";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronUp, ChevronDown, Ban } from "lucide-react";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/shadcn.utils";
import { useGetUsers, useViewportResize, useBulkToggleUserBan } from "./page.hooks";
import { useUserTableStore, useBulkOperationStore, useViewportPagination, useUserDetailDialogStore, useConfirmationDialogStore } from "./page.stores";
import { UserDetailDialog } from "./UserDetailDialog";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { RoleBadge } from "@/components/RoleBadge";
import { useAppStore } from "@/app/layout.stores";
import { canAccessAdminUI, isSuperAdmin } from "@/lib/client-role.utils";

export default function UsersPage() {
  const { data: user } = useGetUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const [immediateSearch, setImmediateSearch] = useState("");

  const {
    search,
    sort,
    page,
    itemsPerPage,
    selectedItems,
    setSearch,
    setSort,
    setPage,
    setItemsPerPage,
    toggleSelected,
    selectAll,
    clearSelection,
  } = useUserTableStore();

  const { isVisible: bulkVisible, isLoading: bulkLoading } = useBulkOperationStore();
  const { calculateItemsPerPage } = useViewportPagination();
  const { openDialog: openUserDetail } = useUserDetailDialogStore();
  const { openDialog: openConfirmation } = useConfirmationDialogStore();

  const { data: userWithMembers } = useGetUserMembers();
  const { selectedOrganizationIds } = useAppStore();
  const { data: usersData, isLoading } = useGetUsers(selectedOrganizationIds);
  const bulkToggleUserBanMutation = useBulkToggleUserBan();

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 0;
  const totalItems = usersData?.totalCount || 0;

  const isSuperAdminUser = isSuperAdmin(userWithMembers || null);
  const canManageUsers = isSuperAdminUser || canAccessAdminUI(userWithMembers || null, selectedOrganizationIds);

  useViewportResize((height) => {
    const newItemsPerPage = calculateItemsPerPage(height);
    if (newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage);
    }
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearch(immediateSearch);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [immediateSearch, setSearch]);

  useEffect(() => {
    if (selectedItems.size > 0) {
      useBulkOperationStore.getState().setVisible(true);
    } else {
      useBulkOperationStore.getState().setVisible(false);
    }
  }, [selectedItems.size]);

  if (!user) return null;

  if (!canManageUsers) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400">
            You need admin permissions to access user management.
          </p>
        </div>
      </div>
    );
  }

  const handleSort = (column: string) => {
    setSort(column, null);
  };

  const getSortIcon = (column: string) => {
    if (sort.column !== column) {
      return <ChevronUp className="w-4 h-4 opacity-0" />;
    }
    if (sort.direction === "asc") {
      return <ChevronUp className="w-4 h-4" />;
    }
    if (sort.direction === "desc") {
      return <ChevronDown className="w-4 h-4" />;
    }
    return <ChevronUp className="w-4 h-4 opacity-0" />;
  };

  const isAllSelected = users.length > 0 && selectedItems.size === users.length;
  const isSomeSelected = selectedItems.size > 0 && selectedItems.size < users.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      clearSelection();
    } else {
      selectAll(users);
    }
  };


  const handleBulkBan = () => {
    const selectedUserIds = Array.from(selectedItems);
    const selectedUserCount = selectedUserIds.length;

    openConfirmation(
      'bulkBan',
      'Bulk Ban Users',
      `Are you sure you want to ban ${selectedUserCount} selected users? This will prevent them from accessing the system.`,
      () => {
        bulkToggleUserBanMutation.mutate({
          userIds: selectedUserIds,
          banned: true,
          banReason: "Banned by admin (bulk operation)"
        });
        clearSelection();
      }
    );
  };


  const getOrganizationsDisplay = (userMembers: { organization: { name: string } }[]) => {
    if (userMembers.length === 0) return "No organizations";
    if (userMembers.length === 1) return userMembers[0].organization.name;
    return `${userMembers[0].organization.name} (+${userMembers.length - 1} more)`;
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-50 mt-1">Manage users and their access</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={immediateSearch}
              onChange={(e) => setImmediateSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {bulkVisible && (
        <div className="mb-4">
          <Popover open={bulkVisible}>
            <PopoverTrigger asChild>
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-sm text-blue-700 mr-2">
                  {selectedItems.size} selected
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 bg-white border border-gray-200 rounded-md shadow-lg">
              <button
                onClick={handleBulkBan}
                disabled={bulkLoading || bulkToggleUserBanMutation.isPending}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
              >
                <Ban className="w-4 h-4 mr-2" />
                {bulkToggleUserBanMutation.isPending ? "Banning..." : "Ban Selected"}
              </button>
            </PopoverContent>
          </Popover>
        </div>
      )}

      <div className="flex-1 overflow-hidden bg-card border border-border rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-12 px-6 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=indeterminate]:bg-blue-500"
                    style={{
                      backgroundColor: isSomeSelected ? '#3b82f6' : undefined
                    }}
                  />
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center space-x-1 hover:text-foreground"
                  >
                    <span>Name</span>
                    {getSortIcon("name")}
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center space-x-1 hover:text-foreground"
                  >
                    <span>Email</span>
                    {getSortIcon("email")}
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("role")}
                    className="flex items-center space-x-1 hover:text-foreground"
                  >
                    <span>Role</span>
                    {getSortIcon("role")}
                  </button>
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Organizations
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center space-x-1 hover:text-foreground"
                  >
                    <span>Created</span>
                    {getSortIcon("createdAt")}
                  </button>
                </th>

              </tr>
            </thead>

            <tbody className="bg-card divide-y divide-border">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-4 h-4 bg-muted rounded" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {search ? `No users found matching "${search}"` : "No users found"}
                  </td>
                </tr>
              ) : (
                users.map((userData) => (
                  <tr
                    key={userData.id}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => openUserDetail(userData)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.has(userData.id)}
                        onCheckedChange={() => toggleSelected(userData.id)}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {userData.name || "No Name"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-foreground">
                      {userData.email}
                    </td>

                    <td className="px-6 py-4">
                      <RoleBadge
                        role={userData.role}
                        variant="compact"
                        organizationName={userData.members?.[0]?.organization?.name}
                      />
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {getOrganizationsDisplay(userData.members)}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(userData.createdAt).toLocaleDateString()}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {page * itemsPerPage + 1} to {Math.min((page + 1) * itemsPerPage, totalItems)} of {totalItems} results
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "px-3 py-1 text-sm border rounded-md",
                    pageNum === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  )}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <UserDetailDialog />
      <ConfirmationDialog />
    </div>
  );
}
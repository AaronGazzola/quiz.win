"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useEffect, useRef, useState } from "react";
import { Search, ChevronUp, ChevronDown, Ban, BanIcon } from "lucide-react";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { cn } from "@/lib/shadcn.utils";
import { useGetUsers, useToggleUserBan, useViewportResize } from "./page.hooks";
import { useGetUserOrganizations } from "../quizzes/page.hooks";
import { useUserTableStore, useBulkOperationStore, useViewportPagination } from "./page.stores";
import { RoleBadge } from "@/components/RoleBadge";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function UsersPage() {
  const { data: user } = useGetUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const [immediateSearch, setImmediateSearch] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

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

  const { data: organizations } = useGetUserOrganizations();
  const { data: usersData, isLoading } = useGetUsers(selectedOrganization || undefined);
  const toggleUserBanMutation = useToggleUserBan();

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 0;
  const totalItems = usersData?.totalCount || 0;

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

  const handleToggleBan = (userId: string, currentBanned: boolean) => {
    toggleUserBanMutation.mutate({
      userId,
      banned: !currentBanned,
      banReason: !currentBanned ? "Banned by admin" : undefined
    });
  };


  const getOrganizationsDisplay = (userMembers: { organization: { name: string } }[]) => {
    if (userMembers.length === 0) return "No organizations";
    if (userMembers.length === 1) return userMembers[0].organization.name;
    return `${userMembers[0].organization.name} (+${userMembers.length - 1} more)`;
  };

  const selectedOrgName = organizations?.find(org => org.id === selectedOrganization)?.name || organizations?.[0]?.name;

  return (
    <div ref={containerRef} className="flex flex-col h-full p-6">
      <Breadcrumb
        items={[{ label: "User Management" }]}
        organizationName={selectedOrgName}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-50 mt-1">Manage users and their access</p>
        </div>

        <div className="flex items-center gap-4">
          {organizations && organizations.length > 1 && (
            <select
              value={selectedOrganization || ""}
              onChange={(e) => setSelectedOrganization(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}

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
                onClick={() => console.log("Bulk ban users")}
                disabled={bulkLoading}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban Selected
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

                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
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
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    {search ? `No users found matching "${search}"` : "No users found"}
                  </td>
                </tr>
              ) : (
                users.map((userData) => (
                  <tr key={userData.id} className="hover:bg-muted/50">
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

                    <td className="px-6 py-4 text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleBan(userData.id, userData.banned)}
                          disabled={toggleUserBanMutation.isPending}
                          className={cn(
                            "hover:opacity-80 transition-opacity",
                            userData.banned
                              ? "text-green-600 hover:text-green-900"
                              : "text-red-600 hover:text-red-900"
                          )}
                          title={userData.banned ? "Unban User" : "Ban User"}
                        >
                          <BanIcon className="w-4 h-4" />
                        </button>
                      </div>
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
    </div>
  );
}
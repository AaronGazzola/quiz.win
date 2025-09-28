"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUsersAction, toggleUserBanAction, changeUserRoleAction, bulkToggleUserBanAction, updateMultipleUserRolesAction } from "./page.actions";
import { useUserTableStore } from "./page.stores";
import { useEffect } from "react";

export const useGetUsers = (organizationIds?: string[]) => {
  const { search, sort, page, itemsPerPage } = useUserTableStore();
  const orgIdsKey = organizationIds?.join(',') || '';

  return useQuery({
    queryKey: [
      "users",
      orgIdsKey,
      search,
      sort.column,
      sort.direction,
      page,
      itemsPerPage
    ],
    queryFn: async () => {
      const { data, error } = await getUsersAction(
        organizationIds,
        search || undefined,
        sort.column || undefined,
        sort.direction || undefined,
        page,
        itemsPerPage
      );
      if (error) throw new Error(error);
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useToggleUserBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      banned,
      banReason
    }: {
      userId: string;
      banned: boolean;
      banReason?: string;
    }) => {
      const { data, error } = await toggleUserBanAction(userId, banned, banReason);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (banned) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`User ${banned ? 'banned' : 'unbanned'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      organizationId,
      newRole
    }: {
      userId: string;
      organizationId: string;
      newRole: string;
    }) => {
      const { data, error } = await changeUserRoleAction(userId, organizationId, newRole);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });
};

export const useBulkToggleUserBan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userIds,
      banned,
      banReason
    }: {
      userIds: string[];
      banned: boolean;
      banReason?: string;
    }) => {
      const { data, error } = await bulkToggleUserBanAction(userIds, banned, banReason);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (successCount, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${successCount} users ${variables.banned ? 'banned' : 'unbanned'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update users");
    },
  });
};

export const useUpdateMultipleUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      roleChanges
    }: {
      userId: string;
      roleChanges: { organizationId: string; newRole: string }[];
    }) => {
      const { data, error } = await updateMultipleUserRolesAction(userId, roleChanges);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (successCount) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${successCount} role(s) updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user roles");
    },
  });
};

export const useViewportResize = (callback: (height: number) => void) => {
  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      callback(height);
    };

    const resizeObserver = new ResizeObserver(handleResize);

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [callback]);
};
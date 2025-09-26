"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUsersAction, toggleUserBanAction } from "./page.actions";
import { useUserTableStore } from "./page.stores";
import { useGetUserOrganizations } from "../quizzes/page.hooks";
import { useEffect } from "react";

export const useGetUsers = (organizationId?: string) => {
  const { search, sort, page, itemsPerPage } = useUserTableStore();

  return useQuery({
    queryKey: [
      "users",
      organizationId,
      search,
      sort.column,
      sort.direction,
      page,
      itemsPerPage
    ],
    queryFn: async () => {
      const { data, error } = await getUsersAction(
        organizationId,
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
      toast.success(`User ${banned ? 'banned' : 'unbanned'} successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });
};

export { useGetUserOrganizations } from "../quizzes/page.hooks";

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
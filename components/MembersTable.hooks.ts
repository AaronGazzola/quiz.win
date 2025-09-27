"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getOrganizationMembersAction,
  updateMemberRoleAction,
  removeMemberAction,
} from "./MembersTable.actions";

export const useGetOrganizationMembers = (organizationId: string) => {
  return useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await getOrganizationMembersAction(organizationId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      updateMemberRoleAction(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success("Member role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update member role");
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMemberAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      toast.success("Member removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to remove member");
    },
  });
};
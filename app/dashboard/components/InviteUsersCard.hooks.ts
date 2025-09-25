"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  inviteUsersAction,
  getPendingInvitationsAction,
  revokeInvitationAction,
  InvitationData,
} from "./InviteUsersCard.actions";

export const useInviteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteUsersAction,
    onSuccess: (data) => {
      const result = data.data;
      if (result) {
        let message = "";
        if (result.invited > 0) {
          message += `${result.invited} invitation${result.invited !== 1 ? "s" : ""} sent`;
        }
        if (result.existing > 0) {
          if (message) message += ", ";
          message += `${result.existing} user${result.existing !== 1 ? "s" : ""} already exist${result.existing === 1 ? "s" : ""}`;
        }
        if (result.invalid.length > 0) {
          if (message) message += ", ";
          message += `${result.invalid.length} invalid email${result.invalid.length !== 1 ? "s" : ""}`;
        }

        if (result.invited > 0) {
          toast.success(message);
        } else {
          toast.warning(message || "No invitations sent");
        }

        queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
        queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to send invitations");
    },
  });
};

export const useGetPendingInvitations = (organizationId: string) => {
  return useQuery({
    queryKey: ["pending-invitations", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await getPendingInvitationsAction(organizationId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeInvitationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      toast.success("Invitation revoked successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to revoke invitation");
    },
  });
};
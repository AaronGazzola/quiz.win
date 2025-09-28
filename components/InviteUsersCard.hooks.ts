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
    mutationFn: (data: InvitationData) => {
      console.log(JSON.stringify({useInviteUsers:"mutation_start",emailCount:data.emails.length,orgId:data.organizationId,role:data.role}));
      return inviteUsersAction(data);
    },
    onSuccess: (data) => {
      console.log(JSON.stringify({useInviteUsers:"success",data:data.data}));

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

        console.log(JSON.stringify({useInviteUsers:"toast_message",message}));

        if (result.invited > 0) {
          toast.success(message);
        } else {
          toast.warning(message || "No invitations sent");
        }

        console.log(JSON.stringify({useInviteUsers:"invalidating_queries"}));
        queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
        queryClient.invalidateQueries({ queryKey: ["organization-members"] });
      }
    },
    onError: (error: Error) => {
      console.log(JSON.stringify({useInviteUsers:"error",error:error.message}));
      toast.error(error?.message || "Failed to send invitations");
    },
  });
};

export const useGetPendingInvitations = (organizationId: string) => {
  return useQuery({
    queryKey: ["pending-invitations", organizationId],
    queryFn: async () => {
      console.log(JSON.stringify({useGetPendingInvitations:"query_start",orgId:organizationId}));

      if (!organizationId) {
        console.log(JSON.stringify({useGetPendingInvitations:"no_org_id"}));
        return [];
      }

      const { data, error } = await getPendingInvitationsAction(organizationId);
      if (error) {
        console.log(JSON.stringify({useGetPendingInvitations:"error",error}));
        throw new Error(error);
      }

      console.log(JSON.stringify({useGetPendingInvitations:"success",count:data?.length || 0}));
      return data || [];
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => {
      console.log(JSON.stringify({useRevokeInvitation:"mutation_start",invitationId}));
      return revokeInvitationAction(invitationId);
    },
    onSuccess: (data) => {
      console.log(JSON.stringify({useRevokeInvitation:"success",data}));
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      toast.success("Invitation revoked successfully");
    },
    onError: (error: Error) => {
      console.log(JSON.stringify({useRevokeInvitation:"error",error:error.message}));
      toast.error(error?.message || "Failed to revoke invitation");
    },
  });
};
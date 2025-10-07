"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  acceptInvitationAction,
  declineInvitationAction,
  getPendingInvitationsForUserAction,
} from "./layout.actions";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";

export const useGetPendingInvitations = () => {
  conditionalLog({hook:"useGetPendingInvitations",status:"initialized"},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      conditionalLog({hook:"useGetPendingInvitations",status:"fetching"},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getPendingInvitationsForUserAction();
      if (error) {
        conditionalLog({hook:"useGetPendingInvitations",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        throw new Error(error);
      }
      conditionalLog({hook:"useGetPendingInvitations",status:"success",invitationCount:data?.length},{label:LOG_LABELS.DATA_FETCH});
      return data || [];
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  conditionalLog({hook:"useAcceptInvitation",status:"initialized"},{label:LOG_LABELS.API});

  return useMutation({
    mutationFn: async (invitationId: string) => {
      conditionalLog({hook:"useAcceptInvitation",status:"mutation-start",invitationId},{label:LOG_LABELS.API});
      const { data, error } = await acceptInvitationAction(invitationId);
      if (error) {
        conditionalLog({hook:"useAcceptInvitation",status:"error",error},{label:LOG_LABELS.API});
        throw new Error(error);
      }
      conditionalLog({hook:"useAcceptInvitation",status:"success"},{label:LOG_LABELS.API});
      return data;
    },
    onSuccess: () => {
      conditionalLog({hook:"useAcceptInvitation",status:"on-success"},{label:LOG_LABELS.API});
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-with-members"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success("Successfully joined the organization!");
    },
    onError: (error: Error) => {
      conditionalLog({hook:"useAcceptInvitation",status:"on-error",error:error.message},{label:LOG_LABELS.API});
      toast.error(error.message || "Failed to accept invitation");
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();
  conditionalLog({hook:"useDeclineInvitation",status:"initialized"},{label:LOG_LABELS.API});

  return useMutation({
    mutationFn: async (invitationId: string) => {
      conditionalLog({hook:"useDeclineInvitation",status:"mutation-start",invitationId},{label:LOG_LABELS.API});
      const { data, error } = await declineInvitationAction(invitationId);
      if (error) {
        conditionalLog({hook:"useDeclineInvitation",status:"error",error},{label:LOG_LABELS.API});
        throw new Error(error);
      }
      conditionalLog({hook:"useDeclineInvitation",status:"success"},{label:LOG_LABELS.API});
      return data;
    },
    onSuccess: () => {
      conditionalLog({hook:"useDeclineInvitation",status:"on-success"},{label:LOG_LABELS.API});
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      toast.info("Invitation declined");
    },
    onError: (error: Error) => {
      conditionalLog({hook:"useDeclineInvitation",status:"on-error",error:error.message},{label:LOG_LABELS.API});
      toast.error(error.message || "Failed to decline invitation");
    },
  });
};

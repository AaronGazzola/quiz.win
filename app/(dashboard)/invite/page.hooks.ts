"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrganizationsAction, sendInvitationsAction } from "./page.actions";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";

export const useGetOrganizations = () => {
  conditionalLog({hook:"useGetOrganizations",status:"initialized"},{label:LOG_LABELS.DATA_FETCH});

  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      conditionalLog({hook:"useGetOrganizations",status:"fetching"},{label:LOG_LABELS.DATA_FETCH});
      const { data, error } = await getOrganizationsAction();
      if (error) {
        conditionalLog({hook:"useGetOrganizations",status:"error",error},{label:LOG_LABELS.DATA_FETCH});
        console.error(JSON.stringify({hook:"useGetOrganizations",error}));
        throw new Error(error);
      }
      conditionalLog({hook:"useGetOrganizations",status:"success",orgCount:data?.length},{label:LOG_LABELS.DATA_FETCH});
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSendInvitations = () => {
  conditionalLog({hook:"useSendInvitations",status:"initialized"},{label:LOG_LABELS.API});

  return useMutation({
    mutationFn: async ({
      emails,
      role,
      organizationId
    }: {
      emails: string[],
      role: "admin" | "member",
      organizationId: string
    }) => {
      conditionalLog({hook:"useSendInvitations",status:"mutation-start",emailCount:emails.length,role,organizationId},{label:LOG_LABELS.API});

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(email => emailRegex.test(email.trim()));

      conditionalLog({hook:"useSendInvitations",status:"validation",totalEmails:emails.length,validEmails:validEmails.length},{label:LOG_LABELS.API});

      if (validEmails.length === 0) {
        conditionalLog({hook:"useSendInvitations",status:"error",error:"No valid emails"},{label:LOG_LABELS.API});
        throw new Error("No valid email addresses provided");
      }

      conditionalLog({hook:"useSendInvitations",status:"calling-action"},{label:LOG_LABELS.API});

      const result = await sendInvitationsAction({
        emails: validEmails,
        role,
        organizationId,
      });

      conditionalLog({hook:"useSendInvitations",status:"action-result",result},{label:LOG_LABELS.API});

      if (result.error) {
        conditionalLog({hook:"useSendInvitations",status:"error",error:result.error},{label:LOG_LABELS.API});
        throw new Error(result.error);
      }

      if (!result.data) {
        conditionalLog({hook:"useSendInvitations",status:"error",error:"No data returned"},{label:LOG_LABELS.API});
        throw new Error("No data returned from server");
      }

      conditionalLog({hook:"useSendInvitations",status:"success",data:result.data},{label:LOG_LABELS.API});

      return result.data;
    },
    onSuccess: (data) => {
      conditionalLog({hook:"useSendInvitations",status:"on-success",data},{label:LOG_LABELS.API});

      const { invited, failed, existing, errors } = data;

      if (invited > 0) {
        toast.success(`${invited} invitation${invited === 1 ? '' : 's'} sent successfully`);
        conditionalLog({hook:"useSendInvitations",status:"toast-success",invited},{label:LOG_LABELS.API});
      }

      if (existing > 0) {
        toast.info(`${existing} user${existing === 1 ? '' : 's'} already invited or member${existing === 1 ? '' : 's'}`);
        conditionalLog({hook:"useSendInvitations",status:"toast-info",existing},{label:LOG_LABELS.API});
      }

      if (failed > 0) {
        toast.error(`${failed} invitation${failed === 1 ? '' : 's'} failed. Check console for details.`);
        conditionalLog({hook:"useSendInvitations",status:"toast-error",failed,errors},{label:LOG_LABELS.API});
        console.error("Invitation errors:", errors);
      }
    },
    onError: (error: Error) => {
      console.error(JSON.stringify({ hook: "useSendInvitations", error }));
      conditionalLog({hook:"useSendInvitations",status:"on-error",error:error.message},{label:LOG_LABELS.API});
      toast.error(error.message || "Failed to send invitations");
    },
  });
};
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrganizationsAction } from "./page.actions";
import { organization } from "@/lib/auth-client";
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
        throw new Error(error);
      }
      conditionalLog({hook:"useGetOrganizations",status:"success",orgCount:data?.length},{label:LOG_LABELS.DATA_FETCH});
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSendInvitations = () => {
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

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(email => emailRegex.test(email.trim()));


      if (validEmails.length === 0) {
        throw new Error("No valid email addresses provided");
      }

      let sentCount = 0;
      const errors: string[] = [];

      for (const email of validEmails) {

        try {
          await organization.inviteMember({
            email: email.trim(),
            role,
            organizationId,
            resend: true,
          });
          sentCount++;
        } catch (error) {
          errors.push(`${email}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }


      if (sentCount === 0) {
        throw new Error(`Failed to send any invitations. Errors: ${errors.join(', ')}`);
      }

      if (errors.length > 0) {
      }

      return sentCount;
    },
    onSuccess: (invitationCount) => {
      toast.success(`${invitationCount} invitation${invitationCount === 1 ? '' : 's'} sent successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitations");
    },
  });
};
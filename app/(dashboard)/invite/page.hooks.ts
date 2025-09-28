"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getOrganizationsAction, createOrganizationAction } from "./page.actions";
import { organization } from "@/lib/auth-client";

export const useGetOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await getOrganizationsAction();
      if (error) throw new Error(error);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await createOrganizationAction(name);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success("Organization created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create organization");
    },
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
      console.log(JSON.stringify({useSendInvitations:"start",emailCount:emails.length,role,orgId:organizationId}));

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validEmails = emails.filter(email => emailRegex.test(email.trim()));

      console.log(JSON.stringify({useSendInvitations:"email_validation",valid:validEmails.length,invalid:emails.length-validEmails.length}));

      if (validEmails.length === 0) {
        console.log(JSON.stringify({useSendInvitations:"no_valid_emails"}));
        throw new Error("No valid email addresses provided");
      }

      let sentCount = 0;
      const errors: string[] = [];

      for (const email of validEmails) {
        console.log(JSON.stringify({useSendInvitations:"sending_to",email:email?.substring(0,3)+"***"}));

        try {
          await organization.inviteMember({
            email: email.trim(),
            role,
            organizationId,
            resend: true,
          });
          sentCount++;
          console.log(JSON.stringify({useSendInvitations:"sent_success",email:email?.substring(0,3)+"***"}));
        } catch (error) {
          console.log(JSON.stringify({useSendInvitations:"send_failed",email:email?.substring(0,3)+"***",error:error instanceof Error?error.message:String(error)}));
          errors.push(`${email}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      console.log(JSON.stringify({useSendInvitations:"batch_complete",sentCount,errorCount:errors.length}));

      if (sentCount === 0) {
        console.log(JSON.stringify({useSendInvitations:"all_failed",errors:errors.length}));
        throw new Error(`Failed to send any invitations. Errors: ${errors.join(', ')}`);
      }

      if (errors.length > 0) {
        console.log(JSON.stringify({useSendInvitations:"partial_success",sentCount,failedCount:errors.length}));
      }

      return sentCount;
    },
    onSuccess: (invitationCount) => {
      console.log(JSON.stringify({useSendInvitations:"mutation_success",invitationCount}));
      toast.success(`${invitationCount} invitation${invitationCount === 1 ? '' : 's'} sent successfully`);
    },
    onError: (error: Error) => {
      console.log(JSON.stringify({useSendInvitations:"mutation_error",error:error.message}));
      toast.error(error.message || "Failed to send invitations");
    },
  });
};
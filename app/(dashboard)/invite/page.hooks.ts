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
          console.error(`Failed to send invitation to ${email}:`, error);
          errors.push(`${email}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      if (sentCount === 0) {
        throw new Error(`Failed to send any invitations. Errors: ${errors.join(', ')}`);
      }

      if (errors.length > 0) {
        console.warn(`Some invitations failed: ${errors.join(', ')}`);
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
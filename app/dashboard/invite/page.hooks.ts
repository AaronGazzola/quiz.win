"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Organization } from "@prisma/client";
import { toast } from "sonner";
import { getOrganizationsAction, createOrganizationAction, sendInvitationsAction } from "./page.actions";

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
      const { data, error } = await sendInvitationsAction(emails, role, organizationId);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (invitationCount) => {
      toast.success(`${invitationCount} invitation${invitationCount === 1 ? '' : 's'} sent successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitations");
    },
  });
};
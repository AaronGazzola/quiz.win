"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { processInvitationAction } from "./page.actions";

export const useProcessInvitation = () => {
  return useMutation({
    mutationFn: async ({ organizationId, role }: { organizationId: string, role: string }) => {
      const { data, error } = await processInvitationAction(organizationId, role);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success("Successfully joined the organization!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to join organization");
    },
  });
};
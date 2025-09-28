"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { processInvitationAction, getDashboardMetricsAction } from "./page.actions";

export const useProcessInvitation = () => {
  return useMutation({
    mutationFn: async ({ organizationId }: { organizationId: string, role: string }) => {
      const { data, error } = await processInvitationAction(organizationId);
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

export const useGetDashboardMetrics = (organizationIds?: string[]) => {
  const orgIdsKey = organizationIds?.join(',') || '';

  return useQuery({
    queryKey: ["dashboard-metrics", orgIdsKey],
    queryFn: async () => {
      const { data, error } = await getDashboardMetricsAction(organizationIds);
      if (error) throw new Error(error);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!organizationIds,
  });
};
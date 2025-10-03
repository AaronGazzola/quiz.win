"use client";

import { useQuery } from "@tanstack/react-query";
import { getParents } from "./page.actions";
import { useAppStore } from "@/app/layout.stores";

export function useParentManagement() {
  const { selectedOrganizationIds } = useAppStore();
  const currentCampusId = selectedOrganizationIds[0];

  const {
    data: parentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["parents", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const response = await getParents(currentCampusId);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!currentCampusId,
  });

  return {
    parents: parentsData || [],
    isLoading,
    refetch,
    currentCampusId,
  };
}
